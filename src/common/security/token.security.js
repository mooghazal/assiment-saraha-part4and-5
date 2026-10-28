
import jwt from 'jsonwebtoken';
import {ACCESS_ADMIN_TOKEN_SIGNING,ACCESS_TOKEN_EXPIRES_IN,ACCESS_USER_TOKEN_SIGNING,REFRESH_ADMIN_TOKEN_SIGNING,  REFRESH_TOKEN_EXPIRES_IN,  REFRESH_USER_TOKEN_SIGNING} from '../../config.js';
import { findById } from '../repository/index.js';
import { findOne } from '../repository/index.js';
import { UserModel } from '../../DB/Model/index.js';
import { BadRequestException, NotFoundException } from '../exceptions/error.exception.js';
import { RoleEnum } from '../enum/enum.gender.js';
import { TokenTypeEnum } from '../enum/security.enum.js';
import { comparePassword } from './hash.security.js';
import { randomUUID } from 'crypto';
import { exist, set } from '../services/cache.service.js';
import { UnauthorizedExecution as UnauthorizedException } from '../exceptions/error.exception.js';



export const userBaseRevokedTokenKey=({userId})=>{
    return `User::${userId.toString()}::Revoke_Token`
}

export const userRevokedTokenKey=({userId,jti})=>{
    return `${userBaseRevokedTokenKey({userId})}::${jti}`
}


export const createToken=async({payload={} , options={},secret=ACCESS_USER_TOKEN_SIGNING}={})=>{
    return jwt.sign(payload,secret,options)
}


export const verifyToken=async({token="", secret=ACCESS_USER_TOKEN_SIGNING}={})=>{
    return jwt.verify(token,secret)
}





const getTokenSignatures = async ({ role = RoleEnum.USER } = {}) => {
    let signatures;

    switch (role) {

        case RoleEnum.ADMIN:
            signatures = { accessSignature: ACCESS_ADMIN_TOKEN_SIGNING, refreshSignature: REFRESH_ADMIN_TOKEN_SIGNING }
            break;
        default:
            signatures = { accessSignature: ACCESS_USER_TOKEN_SIGNING, refreshSignature: REFRESH_USER_TOKEN_SIGNING }
            break;
    }
    return signatures
}





const getSignature = async ({ tokenType = TokenTypeEnum.ACCESS , rolee=RoleEnum.USER  } = {}) => {       
    const { accessSignature, refreshSignature } = await getTokenSignatures({ role: rolee })
    return tokenType == TokenTypeEnum.ACCESS ? accessSignature : refreshSignature
}










export const decodeToken=async({authorization="", tokenType = TokenTypeEnum.ACCESS}={})=>{
    // علشان تقرا الرول من التوكن 
const decoded=jwt.decode(authorization);
if(!decoded?.sub?.length){
    throw BadRequestException('missing Token payload')
}
const payload=await verifyToken({token:authorization, secret: await getSignature({ tokenType: tokenType , role:decoded.audience[0]})})
if(!payload?.sub){
    throw BadRequestException('missing Token payload')
}

if(await exist({key:userRevokedTokenKey({userId:payload.sub, jti:payload.jti})})){
    throw UnauthorizedException('Expired login credentials ')
}



const user=await findById({model:UserModel, id:payload.sub})
if(!user){
    throw NotFoundException('invaild account')
}

if(user.changeCreadentialsTime?.getTime()?? 0 > payload.iat * 1000){
    throw UnauthorizedException('Expired login credentials ')
}
return {user, payload}
}



export const createLoginCredentials = async ({user, issuer, options = {}}) => {
    const { accessSignature, refreshSignature } = await getTokenSignatures({ role:user.role })
    const jwtid=randomUUID();
    const access_token = await createToken({
      payload:{sub:user._id},
        secret: accessSignature,
        options: {
            ...options,
            ...(issuer ? { issuer } : {}),
            audience: [user.role],
            expiresIn: ACCESS_TOKEN_EXPIRES_IN,
            jwtid
        }
    })
    const refresh_token = await createToken({
        payload:{sub:user._id},
        secret: refreshSignature,
        options: {
            ...options,
            ...(issuer ? { issuer } : {}),
            audience: [user.role],
            expiresIn: REFRESH_TOKEN_EXPIRES_IN,
            jwtid
        }, 
    })
    return { access_token, refresh_token }
}







export const createRevokeToken=async({payload})=>{
     const consumedTime = (Math.ceil(Date.now() / 1000) - payload.iat);
    const refreshExpiresIn = payload.iat + REFRESH_TOKEN_EXPIRES_IN;
    const ttl = refreshExpiresIn - consumedTime;
    console.log({ payload, consumedTime, refreshExpiresIn, ttl });
    await set({ key: userRevokedTokenKey({ userId: payload.sub, jti: payload.jti }), value: payload.jti, ttl });
    return;

}





export const basicAuth = async ({ email, password }) => {
    const user = await findOne({
        model: UserModel,
        filter: {
            email,
        }
    })
    if (!user) return NotFoundException("not Exist")
    const match = await comparePassword(password, user.password)

    if (!match) return NotFoundException("not Exist")
    return user
}

