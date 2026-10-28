import { Router } from 'express'
import { successResponse } from '../../common/utils/index.js'
import { authentication, authorization, uploadMiddleware } from '../../middleware/index.js'
import { TokenTypeEnum } from '../../common/enum/security.enum.js'
import { RoleEnum } from '../../common/enum/enum.gender.js'
import { profile, rotateToken, updateProfile } from './user.service.js'
import { localFileUpload, fileValidation } from '../../common/utils/index.js'
import { logout } from './user.service.js'

const router = Router()


router.get("/", authentication(), async (req, res, next) => {
    const data = await profile(req.user)
    return successResponse({ res, data })
})


router.patch("/", authentication(),authorization(RoleEnum.ADMIN), async (req, res, next) => {
    const data = await updateProfile(req.user, req.body)
    return successResponse({ res, data })
})





router.post("/rotate-token", authentication(TokenTypeEnum.REFRESH), async (req, res, next) => {
    const data = await rotateToken(req.payload, req.user , `${req.protocol}://${req.host}`)
    return successResponse({ res, data })
})




router.post("/logout", authentication(),async(req,res,next)=>{
    const data=await logout(req.payload,req.user, req.body)
    return successResponse({res,data})
})

router.patch(
    "/profile-image",
    authentication(),
    uploadMiddleware({
        isRequired: false,
        multerMiddleware: localFileUpload({ maxFileSize: 2 }).single("attachment"),
        customPath: "users",
        validation: fileValidation.image
    }),
    async (req, res, next) => {
        console.log({ after: req.body });
        req.user.image = req.file.finalPath;
        await req.user.save()
        return successResponse({ res, data: { user: req.user } })
    }
)

export default router


