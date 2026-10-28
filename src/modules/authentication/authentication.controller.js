

import { Router } from 'express'
import { login, signUp, signupWithGmail, confirmEmail, resendConfirmEmail, requestForgetPasswordCode, verifyForgetPasswordCode, resetForgetPassword} from './authentication.service.js' // تأكد إنك مستورد دالة جوجل لو عاملها في الخدمة
import { successResponse } from '../../common/utils/index.js'
import { validation } from '../../middleware/index.js'
import * as validators from './auhtentication.validations.js'


const router = Router()


router.post("/signup", validation(validators.signup), async (req, res, next) => {
  const data = await signUp(req.body)
  return successResponse({ res, status: 201, data })
})



router.post("/login", validation(validators.login), async (req, res, next) => {
  const data = await login(req.validate.body, `${req.protocol}://${req.host}`)
  return successResponse({ res, data })
})



router.post("/signup-with-gmail", async (req, res) => {
  const { status, data} = await signupWithGmail(req.body , `${req.protocol}://${req.host}`); 
  return successResponse({ res, data, message: "Logged in with Gmail successfully", status: status })
})



router.patch("/confirm-email" , validation(validators.confirmEmail),async(req,res,next)=>{
  const data=await confirmEmail(req.body)
  return successResponse({res, status:200,data})
})


router.patch("/resend-confirm-email" , validation(validators.resendConfirmEmail()),async(req,res,next)=>{
  const data=await resendConfirmEmail(req.body)
  return successResponse({res, status:200,data})
})


//أنا نسيت الباسورد، ابعتلي كود على إيميلي
router.post("/request-forget-password",validation(validators.resendConfirmEmail()),async(req,res,next)=>{
  const data=await requestForgetPasswordCode(req.body)
  return successResponse({res, status:201,data})
})



//ده الإيميل وده الكود اللي وصلني، اتأكد إنهم صح
router.post("/verify-forget-password",validation(validators.confirmEmail),async(req,res,next)=>{
  const data=await verifyForgetPasswordCode(req.body)
  return successResponse({res, status:200,data})
})

//ده إيميلي والكود والباسورد الجديد اللي عايز أستخدمه تغير الباسورد وحفظه
router.patch("/reset-forget-password",validation(validators.restForgetPassword()),async(req,res,next)=>{
  const data=await resetForgetPassword(req.body)
  return successResponse({res, status:200,data})
})
export default router
