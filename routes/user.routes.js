// const express = require("express")
// const Router = express()
import Express  from "express";
const router = Express.Router()
import { forgotPassword, getProfile, login, logout, register, resetPassword } from "../controllers/user.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";
// const router = Router()


router.post("/register", upload.single("avatar") , register)  //=> upload ek middleware hai or yaha pe ham single (ek) file uplode kr rhe hai
router.post("/login" , login)
router.get("/logout" , logout)
router.get("/me" ,isLoggedIn, getProfile)
router.post("/reset" , forgotPassword )
router.post('/reset/:resetToken' ,resetPassword);



export default router;





