import {z} from 'zod';
import { GenderEnum } from './enum/enum.gender.js';

export const matchFields=({original, copy , data, context})=>{
    if(data[original] !== data[copy]){
        context.addIssue({
            code:"custom",
            path:[copy],
            message:`Fail to match between ${original} and ${copy}`
        })
    }
}



export const generalValidationFields={
    email: z.email({message:"invaild email format plase enter falid email like examble@gmail.com"}),
    otp:z.string().regex(/^\d{6}$/,{error:"invalid code"}),
    password: z.string().regex(/^(?=.*[a-z])(?=.*\s{0,})(?=.*[A-Z])(?=.*\d)(?=.*[!@#_$%^&*()]).{8,16}$/).min(8).max(16),
    username: z.string(),
    phone: z.e164(),
    confirmPassword: z.string().min(8).max(16),
    gender:z.union([z.literal(GenderEnum.MALE), z.literal(GenderEnum.FEMALE)]),
    matchFields,
  
}
