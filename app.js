import express  from "express"
import cors from "cors"
import cookieParser from"cookie-parser"
import { config } from "dotenv";
import morgan from "morgan";
import userRouter from "./routes/user.routes.js"
import errorMiddileware from "./middlewares/error.middleware.js";
config()

const app = express()

app.use(express.json())          
app.use(morgan('dev'))          //isko dene ham console me dekh sakte hai ki kis type ki url user find kr rha hai (wrong ya true)
app.use(cookieParser())
app.use(express.urlencoded({extended:true}))  //ye parameter me diye token ko encode krta hai


app.use(cors({
    origin:[process.env.FRONTEND_URL],
    credentials:true          //ye cookie ko ek jagah se dusri jagah le jati hai
}))






app.use("/ping" , function(req ,res){
        res.send("pong")
})

app.use('/api/v1/user' , userRouter)


app.all("*" ,(req ,res)=>{    //user agr rout ke alaya koi or ulr search kre joni hamne di hi tab ye usko error 404 send krega
    res.status(404).send('OOps!! 404 page not found')
})

app.use(errorMiddileware)



export default app