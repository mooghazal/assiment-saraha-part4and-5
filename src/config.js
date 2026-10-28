import { resolve } from 'node:path'
import config from 'dotenv'

export const NODE_ENV = process.env.NODE_ENV ?? 'development'

// اقرا متغيرات البيئه من الملف دا
config.config({ path: resolve(`.env.${NODE_ENV}`) })

export const PORT = parseInt(process.env.PORT ?? '9000')
export const SALT = parseInt(process.env.SALT ?? '12')

export const DB_URI=process.env.DB_URI
export const REDIS_URI=process.env.REDIS_URI
export const ENC_KEY=process.env.ENC_KEY ?? 'ae4b33575ad9d25c13aba6a6ccd284cb'
export const IV_LENGTH=parseInt(process.env.IV_LENGTH ?? '16')



export const ACCESS_USER_TOKEN_SIGNING=process.env.ACCESS_USER_TOKEN_SIGNING ?? 'CXder#dkgr_A'
export const ACCESS_ADMIN_TOKEN_SIGNING=process.env.ACCESS_ADMIN_TOKEN_SIGNING ?? 'CXder#dkgr_U'
export const REFRESH_USER_TOKEN_SIGNING=process.env.REFRESH_USER_TOKEN_SIGNING ?? 'CXder#dkgr_B'
export const REFRESH_ADMIN_TOKEN_SIGNING=process.env.REFRESH_ADMIN_TOKEN_SIGNING ?? 'CXder#dkgr_V'
export const ACCESS_TOKEN_EXPIRES_IN=parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN ?? '1800')
export const REFRESH_TOKEN_EXPIRES_IN=parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN ?? '31536000')
    





export const APP_EMAIL=process.env.APP_EMAIL
export const APP_PASSWORD=process.env.APP_PASSWORD
export const APPLICATION_NAME=process.env.APPLICATION_NAME
