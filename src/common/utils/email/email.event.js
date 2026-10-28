
import {EventEmitter} from "node:events";

import {sendEmail} from "./send.email.js";

export const emailEvent=new EventEmitter();

emailEvent.on("sendEmail", async({recipients , subject,data})=>{
   try{
     await sendEmail({
        ...recipients,
        subject,
        html:`<h1>CODE::${data.code}</h1>`,
    })
   }catch(err){
    console.error("Error while sending email event:", err);
   }
})

