// import studentModel from "../Models/StudentSchema.js"
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose'
import studentModel from '../Models/StudentSchema.js'
import moment from 'moment'
import fs from 'fs'
import path from 'path'
import csv from 'fast-csv'
import { type } from 'os'
const BASE_URL = process.env.BASE_URL

class studentController{


    static createDoc = async (req,res) => {
        try {
            const profile = req.file.filename;
            const {username,email,age,prof,address,status,gender} = req.body
            if(!username||!email||!age||!prof||!address||!status||!gender||!profile){
                res.status(401).json("All Fields are required...")
            }

            const singleUser =  await studentModel.findOne({email:email});
            if(singleUser){
                res.status(401).json("This email address already exist...")
            }
            else{
                const dateCreated = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
                const student = new studentModel({
                    username,
                    email,
                    age, 
                    prof,
                    address,
                    status,
                    gender,
                    profile,
                    dateCreated
                })
                const result = await student.save();
                res.status(200).json(result)
            }
        } catch (error) {
            if (error.name === "ValidationError") {
                return res.status(400).json({ error: "Validation Error", details: error.errors });
            }
            res.status(500).json({ error: error });
        }
    }
    static updateDocById = async (req,res) => {
        const allStudents = await studentModel.find()
        let newArr = []
        allStudents.map((val)=>{
            newArr.push(val._id.toString())
        })
        const emails = allStudents
                                .filter(val => val.email !== req.body.email)
                                .map(val => val.email);
        
        if(!newArr.includes(req.params.id)){
            const filePath = path.join(new URL(`../uploads/${req.file.filename}`, import.meta.url).toString());
            const exactPath = filePath.replace(/^file:\\/, '')
            fs.unlinkSync(exactPath);
        }

        if(newArr.includes(req.params.id)){
            const singleUser =  await studentModel.findOne({_id:req.params.id});
            if(singleUser.email === req.body.email && !emails.includes(req.body.email) ){
            try {
                if(req.params.id){
                const {username,email,age,prof,address,status,gender} = req.body
                const profile = req.file.filename
                if(!username||!email||!age||!prof||!address||!status||!gender||!profile){
                    res.status(401).json("All Fields are required...")
                }
                const data = {
                    username,
                    email,
                    age,
                    prof,
                    address,
                    status,
                    gender,
                    profile
                }
                const singleUser =  await studentModel.findOne({_id:req.params.id});
                const filePath = path.join(new URL(`../uploads/${singleUser.profile}`, import.meta.url).toString());
                const exactPath = filePath.replace(/^file:\\/, '')
                fs.unlinkSync(exactPath);
                const student = await studentModel.updateOne({'_id':req.params.id},data)
                res.status(200).json({message:"Document Updated Successfully..."})
            }else{
                res.status(501).json({message:"Please give an ID."})
            }
            } catch (error) {
                res.status(500).json({message:error})
            }
            }else{
                const filePath = path.join(new URL(`../uploads/${req.file.filename}`, import.meta.url).toString());
                const exactPath = filePath.replace(/^file:\\/, '')
                fs.unlinkSync(exactPath);
                res.status(500).send({message:"This email is already taken"})
            }
        }
    }
    static deleteDocById = async (req, res) => {
        try {
            const student = await studentModel.findByIdAndDelete(req.params.id)
            const filePath = path.join(new URL(`../uploads/${student.profile}`, import.meta.url).toString());
            const exactPath = filePath.replace(/^file:\\/, '')
            fs.unlinkSync(exactPath);
            if (!student) {
                return res.status(404).json({ message: "Document not found" });
            }
            res.status(200).json({ message: "Profile deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: error });
        }
    };
    
    static getAllDoc = async (req,res) => {

        const search = req.query.search || ""
        const gender = req.query.gender || ""
        const status = req.query.status || ""
        const sort = req.query.sort || ""
        const page = req.query.page || 1
        const ITEM_PER_PAGE = 5
        const query = {
            username:{$regex:search,$options:"i"}
        }
        if(gender !== "All"){
            query.gender = gender
        }
        if(status !== "All"){
            query.status = status
        }

        try {
            const skip = (page-1)*ITEM_PER_PAGE;
            const count = await studentModel.countDocuments(query);
            const allStudents = await studentModel.find(query).sort({dateCreated:sort==="new"?-1:1}).limit(ITEM_PER_PAGE).skip(skip)
            const pageCount = Math.ceil(count/ITEM_PER_PAGE)
            res.json({
                pagination:{
                    count,pageCount
                },
                allStudents})
        } catch (error) {
            res.status(500).json({message:error})
        }
    }
    static editDoc = async (req,res) => {
        try {
            const student = await studentModel.findById(req.params.id)
            res.status(200).json(student)
        } catch (error) {
            res.status(500).json({ error: error });
        }
    }
    static statusChange = async (req,res) => {
        try {
            const student = await studentModel.findByIdAndUpdate({_id:req.params.id},{status:req.body.data},{new:true})
            res.status(200).json({message:"Status Changed Successfully.."})
        } catch (error) {
            res.status(500).json({ error: error });
        }
    }
    static userExport = async (req,res) => {
        try{
            const students = await studentModel.find();

        if (students.length === 0) {
            return res.status(404).json({ error: "No students found" });
        }

        if (!fs.existsSync("CSV/files")) {
            fs.mkdirSync("CSV/files", { recursive: true });
        }

        if (!fs.existsSync("CSV/files/export")) {
            fs.mkdirSync("CSV/files/export", { recursive: true });
        }

        const writableStream = fs.createWriteStream("CSV/files/export/users.csv");
        const csvStream = csv.format({ headers: true });

        csvStream.pipe(writableStream);

        students.forEach((user) => {
            csvStream.write({
                FirstName: user.username || "-",
                Email: user.email || "-",
                Age: user.age || "-",
                Profession: user.prof || "-",
                Address: user.address || "-",
                Status: user.status || "-",
                Gender: user.gender || "-",
                Profile: user.profile || "-",
                DateCreated: user.dateCreated || "-"
            });
        });

        csvStream.end();

        writableStream.on("finish", function () {
            res.status(200).json({
                downloadUrl: `${BASE_URL}/files/export/users.csv`
            });
        });
        } catch (error) {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }

}


export default studentController