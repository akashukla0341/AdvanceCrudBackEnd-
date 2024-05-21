import multer from 'multer'



const storage = multer.diskStorage({
    destination:(req,file,callback)=>{
        callback(null,'./uploads')
    },
    filename:(req,file,callback)=>{
        const filename = `image=${Date.now()}.${file.originalname}`;
        callback(null,filename)
    }
})


const fileFilter = (req,file,callback) => {
    if(file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg"){
        callback(null,true)
    }else{
        callback(null,false)
        return callback(new Error("only png jpg and jpef format is allowed"))
    }
}

const upload = multer({
    storage:storage,
    fileFilter:fileFilter
})


export default upload