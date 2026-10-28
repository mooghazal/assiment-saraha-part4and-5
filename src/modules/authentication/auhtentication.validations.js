import { z } from "zod";
import { generalValidationFields } from "../../common/validation.js";

export const loginSchema = z.strictObject({
  email: generalValidationFields.email,
  password: generalValidationFields.password
})

export const login=z.object({
  body: loginSchema
  // query:z.strictObject({
  //   lang:z.enum(["ar","en"]).default("ar"),

  //   // darkMode:z.coerce.boolean()
  //   // darkMode:z.stringbool({
  //   //   truthy:["true","1","yes"],
  //   //   falsy:["false","0","no"],
  //   // })
  //   extra:z.literal("25")
  // })
})





export const signup = z.object({
  body:loginSchema.safeExtend({
  username: generalValidationFields.username,
  phone: generalValidationFields.phone,
  confirmPassword: generalValidationFields.confirmPassword,
  gender:generalValidationFields.gender,

  // gender:z.union([z.literal(GenderEnum.MALE),z.literal(GenderEnum.FEMALE)]),




})}).superRefine((data, ctx) => {
  console.log({ data, ctx });

  generalValidationFields.matchFields({original:"password", copy:"confirmPassword", data:data.body,context:ctx})

  if (!data.body.username.includes(" ")) {
    ctx.addIssue({
      code: "custom",
      path: ['body', 'username'],
      message: "username must contain 2  parts"
    })
  }
})







  export const confirmEmail=z.object({
    body:z.strictObject({
      email:generalValidationFields.email,
      otp:generalValidationFields.otp
    })
  })



 export const resendConfirmEmail=()=>{
  return z.object({
    body:z.strictObject({
      email:generalValidationFields.email
 })
})
 }

 export const restForgetPassword=()=>{
  return z.object({
    body:z.strictObject({
      email:generalValidationFields.email,
      password:generalValidationFields.password,
      otp:generalValidationFields.otp,
      confirmPassword:generalValidationFields.confirmPassword
    }).superRefine((data,ctx)=>{
      generalValidationFields.matchFields({original:"password", copy:"confirmPassword",data,context:ctx})
    })
  })
 }









// import { z } from "zod";

// export const login = z.strictObject({

//   email: z.email(),

//   password: z.string().min(8).max(16)

// })


// export const signup = login.extend({

//   username: z.string(),

//   phone: z.e164(),

//   confirmPassword: z.string().min(8).max(16)

// }).superRefine((data, ctx) => {

//   console.log({ data, ctx });

//   if (data.password !== data.confirmPassword) {

//     ctx.addIssue({

//       code: "custom",

//       path: ['confirmPassword'],

//       message: "password mismatch  with confirmation password"

//     })

//   }

//   if (!data.username.includes(" ")) {

//     ctx.addIssue({

//       code: "custom",

//       path: ['username'],

//       message: "username must contain 2  parts"

//     })

//   }

// })
