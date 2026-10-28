import mongoose from "mongoose";
import { GenderEnum, ProviderEnum, RoleEnum } from "../../common/enum/enum.gender.js";


const userSchema=new mongoose.Schema({
    firstName:{
        type:String,
        minLength:2,
        maxLength:25,
        required:true
    },
     lastName:{
        type:String,
        minLength:2,
        maxLength:25,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },

    password:{
        type:String,
        required:function(){
            return this.provider===ProviderEnum.SYSTEM
        }
    },
    phone:{
        type:String,
    },
    DOB:{
        type:Date,
    },
    confirmEmail:{
        type:Date// بيخزن وقت تاكيد الايمل 
    },
    image:{
        type:String
    },
   gender:{
    type:Number,
    enum:Object.values(GenderEnum), //[0,1]
    default:GenderEnum.MALE

   },

   role:{
    type:Number,
    enum:Object.values(RoleEnum),
    default:RoleEnum.USER
   },

   provider:{
    type:Number,
    enum:Object.values(ProviderEnum),
    default:ProviderEnum.SYSTEM
   },
 coverImage:[String],
 changeCreadentialsTime:Date


}

,{
    timestamps:true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true},
    strict:true,
    strictQuery:true,
    autoIndex:true
})


userSchema.virtual('username').set(function(value){

const [firstName,lastName]=value?.split(" ") || []
this.set({firstName:firstName,lastName:lastName})

}).get(function(){
    return `${this.firstName}  ${this.lastName}`
})

export const UserModel=mongoose.model("User",userSchema)