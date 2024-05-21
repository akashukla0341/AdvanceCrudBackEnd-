import mongoose from "mongoose";
import validator from 'validator'

const studentSchema = new mongoose.Schema({
    username:{type:String,required:true,trim:true},
    email:{type:String,required:true,unique:true,validate(value){if(!validator.isEmail(value)){throw error("not a valid email")}}},
    age:{type:Number,required:true,min:10,max:80},
    prof:{type:String,required:true,trim:true},
    address:{type:String,required:true,trim:true},
    status:{type:String,required:true,trim:true},
    gender:{type:String,required:true,trim:true},
    profile:{type:String,required:true,trim:true},
    dateCreated:Date,
    dateUpdated:Date
})

const studentModel =  mongoose.model('AllStudent',studentSchema);

export default studentModel

