import dotenv from 'dotenv';
import express from 'express';
import router from './Routes/Routes.js'
import cors from 'cors'
import connectionDB from './DB/Connection.js';
dotenv.config()

const app = express()
const port = process.env.PORT ||1111;

connectionDB()

app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use(cors());
app.use('/uploads',express.static('./uploads'))
app.use('/files',express.static('./CSV/files'))

app.use('/',router);

app.listen(port,()=>{
    console.log(`server running at ${port}`)
})
