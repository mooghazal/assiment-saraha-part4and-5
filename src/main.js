
import express from 'express'
import {bootstarpDB} from './DB/connectiondb.js'
import {PORT} from './config.js'
import { authenticationController, messageController, userController } from './modules/index.js'
import { globalErrorHandling } from './middleware/index.js'
import cors from 'cors'



const app = express()
app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true
  }));
//إتاحة الملفات الموجودة داخل assets عن طريق روابط HTTP.
  app.use("/assets" ,express.static("assets"))


await bootstarpDB(app, PORT)

// // await set({key:"age", value:25,ttl:60})
// // await set({key:"gender",value:"male"})
// await set({key:"gender", value:{type:"male"}})
// await set({key:"age", value:25})
// console.log(await get({key:"gender"}))
// console.log(await get({key:"age"}))
// console.log(await exist({key:"gender"}))//1
// console.log(await exist({key:"age"}))//0
// console.log(await update({key:"age", value:45, ttl:60}))



app.use(express.json())
app.all('/', (req, res) => res.status(200).send({ message: 'Welcome to BE API' }))
app.use('/auth', authenticationController)
app.use('/message', messageController)
app.use('/user', userController)
app.all('/*dummy', (req, res) => res.status(404).send({ message: 'Invalid application routing' }))
app.use(globalErrorHandling)





// await sendEmail({
//   subject:"TEST8000000",
//   to:["moghazal06@gmail.com"],
//   html:`<h1>Test Email</h1>`,
//   text:"lol lol",
//   attachments:[{contentType:"text/plain" , content:"Hello world"}]
// })

