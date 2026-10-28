
import {findOne} from '../../common/repository/index.js'
import {createOne} from '../../common/repository/index.js'
import {UserModel} from '../../DB/Model/index.js'
import { BadRequestException, conflictException, TooManyRequestsException } from '../../common/exceptions/error.exception.js'
import { NotFoundException } from '../../common/exceptions/error.exception.js'
import { hashPassword, comparePassword, encryption, createLoginCredentials, userBaseRevokedTokenKey } from '../../common/security/index.js'
import { OAuth2Client } from 'google-auth-library'
import { ProviderEnum } from '../../common/enum/enum.gender.js'
import{createOtp} from '../../common/utils/index.js'
import { get, set, del, incrBy, expire, ttl, keys } from '../../common/services/cache.service.js'
import { EmailSubjectEnum } from '../../common/enum/email.enum.js'
import { emailEvent } from '../../common/utils/email/email.event.js'
import {UserEmailKey, UserEmailTrailsKey} from '../../common/utils/email/send.email.js'



const client = new OAuth2Client();
const WEB_CLIENT_IDS = process.env.WEB_CLIENT_IDS;
async function verifyGoogleAccount(idToken) {
    const ticket = await client.verifyIdToken({idToken,audience: WEB_CLIENT_IDS,});
    const payload = ticket.getPayload();
    if (!payload.email_verified) {
        throw BadRequestException("email not verified")
    }
    return payload
}



export const signupWithGmail = async ({ idToken },issuer) => {
  console.log({ idToken });
  const { name, email, picture } = await verifyGoogleAccount(idToken)
  console.log({ name, email, picture });

  let status=201;

const existAccount=await findOne({
  model:UserModel,
  filter:{email},
})

if(existAccount){
  if(existAccount.provider != ProviderEnum.GOOGLE){
    throw conflictException("Invalid account provider")
  }
 
  return {status:200,data:await createLoginCredentials({user:existAccount, issuer})
}
}

const  user=await createOne({
  model:UserModel,
  data:{
    username:name,
    email,
    confirmEmail:new Date(),
    provider:ProviderEnum.GOOGLE,
    image:picture
  }
})

return {status, data:await createLoginCredentials({user, issuer})}
}







export const signUp = async(inputs) => {
const {username,email,password,phone}=inputs
const dublicatedAccount= await findOne({
  model:UserModel,
  filter:{email},
  options:{select:'email'},
})
if(dublicatedAccount) throw conflictException('Email already exists')
const user=await createOne({
  model:UserModel,
  data:{
    username,
    email,
    password:await hashPassword(password),
    phone:await encryption(phone)
  },
})
await sendEmailOtp({email , subject:EmailSubjectEnum.CONFIRM_EMAIL})
return user
}









export const login = async ({ email, password }, issuer) => {

    const account = await findOne({ model: UserModel, filter: { email, provider:ProviderEnum.SYSTEM, confirmEmail: { $exists: true } } })
    if (!account) throw NotFoundException("not Exist", { extra: "lol" })

    const match = await comparePassword(password, account.password)
    if (!match) throw NotFoundException("not Exist")

    return await createLoginCredentials({user:account, issuer})
}







export const confirmEmail=async({email,otp})=>{
  const account=await findOne({model:UserModel,filter:{email,provider:ProviderEnum.SYSTEM,confirmEmail:{$exists:false}}})
  if(!account) throw NotFoundException("invalid account")

const hashOtp=await get({key:UserEmailKey({email, subject:EmailSubjectEnum.CONFIRM_EMAIL})})
if(!hashOtp || !await comparePassword(otp, hashOtp)){
  throw conflictException("invalid Otp")
}

account.confirmEmail=new Date()
await account.save()
await del({key:await keys({prefix:UserEmailTrailsKey({email,subject:EmailSubjectEnum.CONFIRM_EMAIL})})})
return
}









export const resendConfirmEmail = async({email}) => {
const account=await findOne({model:UserModel,filter:{email,provider:ProviderEnum.SYSTEM,confirmEmail:{$exists:false}}})
if(!account) throw NotFoundException("invalid account")
await sendEmailOtp({email , subject:EmailSubjectEnum.CONFIRM_EMAIL})
return

}










const sendEmailOtp=async({email , subject , expiresIn=120, maxTriald=3,blockedInSeconds=300 , title})=>{
  const existOTP_TTl=await ttl({key:UserEmailKey({email, subject})})
  if(existOTP_TTl >0){
    throw conflictException(`soory we can not ceate new otp while existng one stil valid place try agin latre after ${existOTP_TTl} seconds`)
  }

const oldTrails=await get({key:UserEmailTrailsKey({email,subject})})??0
if(oldTrails >= maxTriald){
  throw TooManyRequestsException(`max otp trails has been reaced`)
}
const code=createOtp()
await set({
key:UserEmailKey({email, subject:EmailSubjectEnum.CONFIRM_EMAIL}),
  value:await hashPassword(code.toString()),
  ttl:expiresIn

})
const curentTrails=await incrBy({key:UserEmailTrailsKey({email,subject:EmailSubjectEnum.CONFIRM_EMAIL}), value:1})
if(curentTrails==3){
  await expire({key:UserEmailTrailsKey({email,subject:EmailSubjectEnum.CONFIRM_EMAIL}),ttl:blockedInSeconds})
}
emailEvent.emit("sendEmail" , {recipients:{to:email}, subject:EmailSubjectEnum.CONFIRM_EMAIL , data:{code, title:title??subject}})
}




//ارسال كود الباسورد
export const requestForgetPasswordCode = async({email}) => {
const account=await findOne({model:UserModel,filter:{email,provider:ProviderEnum.SYSTEM,confirmEmail:{$exists:true}}})
if(!account) throw NotFoundException("invalid account")
await sendEmailOtp({email , subject:EmailSubjectEnum.FORGOT_PASSWORD})
return

}


//التحقق من الكود
export const verifyForgetPasswordCode=async({email,otp})=>{
  const account=await findOne({model:UserModel,filter:{email,provider:ProviderEnum.SYSTEM,confirmEmail:{$exists:true}}})
  if(!account) throw NotFoundException("invalid account")

const hashOtp=await get({key:UserEmailKey({email, subject:EmailSubjectEnum.FORGOT_PASSWORD})})
if(!hashOtp || !await comparePassword(otp, hashOtp)){
  throw conflictException("invalid Otp")
}
return account
}









export const resetForgetPassword=async({email,otp,password})=>{
 const account=await verifyForgetPasswordCode({email,otp})
 account.password=await hashPassword(password)
 account.changecredentialsTime=new Date();
 await account.save()
const result=await Promise.all([
  del({key:userBaseRevokedTokenKey({userId:account._id})}),
  del({key:UserEmailKey({email, subject:EmailSubjectEnum.FORGOT_PASSWORD})}),])
await del([...result[0],...result[1]])
return

}





































































































































































































































































// export const login =async (inputs,issuer)=>{
//   const { email, password } = inputs
//   const account = await findOne({
//     model: UserModel,
//     filter: 
//     {
//        email
//     },
//   })
//   if (!account){
//     throw NotFoundException('Invalid credentials')
//   }
//   const match=await comparePassword(password,account.password)
//   if(!match){
//     throw NotFoundException('not match')
//   }

  
//   // account.phone=await decryption(account.phone)
//   // return account


// // const access_Token=jwt.sign({sub:accound._id , extra:"lol"},"hambozo",
// //   {
// //     // subject:account.id,
// //     // noTimestamps:true,
// //     // expiresIn:30,
// //     // notBefore:30,
// //     // issuer,
// //     // audience:["ws" , "x"]
// // })
// // return access_Token
























































// export const login =async (inputs)=>{
//   const { email, password } = inputs
//   const account = await findOne({
//     filter: { email ,password},
//     options: { select: "-password" }
//   })
//   if (!account){
//     throw NotFoundException('Invalid credentials')
//   }
//   return account
// }
