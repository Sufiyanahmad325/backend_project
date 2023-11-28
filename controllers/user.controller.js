import AppError from "../utils/error.utils.js";
import User from "../models/user.models.js";
import cloudinary from "cloudinary";            // cloudinary => ye ek jagah se dusri jagah file uplode or migrate krne me kam aata hai
import fs from "fs/promises"
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto"

const cookieOptions = {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    httpOnly: true, // JavaScript cannot access this cookie
    secure: true, // Recommended for HTTPS environments
};




const register = async (req, res, next) => {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
        return next(new AppError('All fields are required', 400));
    }

    // Check if a user with the same email already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        return next(new AppError('Email already exists', 400));
    }

    // Create a new user with the provided information
    const user = await User.create({
        fullName,
        email,
        password,
        avatar: {
            public_id: email,
            secure_url: "https://images.unsplash.com/photo-1594136662380-3580470c089d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80"
        }
    });

    if (!user) {
        return next(new AppError('User registration failed, please try again', 400));
    }

    // TODO: File upload (You can add this functionality here)
    console.log("file details " + JSON.stringify(req.file));

    if (req.file) {
        try {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "tata",
                width: 250,      // Set the width to 250 pixels
                height: 250,    // Set the height to 250 pixels
                crop: "fill",
                gravity: "face",        // gravity yani face ki traf focus krega
            })
            console.log("file details " + JSON.stringify(result));
            if (result) {
                user.avatar.public_id = result.public_id;
                user.avatar.secure_url = result.secure_url;

                //Remove file from server  => cloudinary pe file store hogi lekin local se file delete ho jayegi
                fs.rm(`uploads/${req.file.filename}`)   //fs.ram yaha pe ham file ko delete kr rahe ha //isme request.file se file name mil jayegi
            }
        } catch (error) {
            return next(new AppError(error || "file not uploaded please try again", 400))
        }
    }


    // Save the user to the database
    await user.save();

    // Remove the password from the user object before sending it to the client
    user.password = undefined;

    // Generate a JWT token for authentication
    const token = await user.generateJWTToken();

    // Set the JWT token as a secure HTTP-only cookie
    res.cookie('token', token, cookieOptions);

    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user,
    });
};



//--------------------------------------------------------------------------------------------------------




const login = async (req, res, next) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return next(new AppError("all fields are required", 400))
        }

        const user = await User.findOne({
            email
        }).select('+password')

        if (!user || !(await user.comparePassword(password))) {
            return next(new AppError("email or password does not match", 400))
        }
        user.password = undefined

        const token = await user.generateJWTToken()
        console.log(token);

        let a = res.cookie("token", token, cookieOptions)
        console.log(a + "999999999999999999999");


        res.status(200).json({
            success: true,
            message: "user loggedin successfully",
            user
        })
    } catch (error) {
        return next(new AppError(error.message, 500))
    }



};








const logout = (req, res) => {
    res.cookie("token", null, {
        secure: true,
        maxAge: 0,
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        message: " User logOut successfully"
    })
};














const getProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId)

        res.status(200).json({
            success: true,
            message: "user details",
            user
        })
    } catch (error) {
        return next(new AppError("failed to fatch profile & user details", 404))
    }

};











const forgotPassword = async (req, res, next) => {
    const { email } = req.body
    if (!email) {
        return next(new AppError('Email is required', 400))
    }

    const user = await User.findOne({ email })
    if (!user) {
        return next(new AppError("Email not register", 400))
    }

    const resetToken = await user.generatePasswordResetToken()
    console.log("this is reset token ", resetToken);
    await user.save()

    const resetPasswordURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`

    console.log(resetPasswordURL);
    const subject = 'Reset Password';

    const message = `You can reset your password by clicking <a href=${resetPasswordURL} target="_blank">Reset your password</a>\nIf the above link does not work for some reason then copy paste this link in new tab ${resetPasswordURL}.\n If you have not requested this, kindly ignore.`;

    try {
        let a = await sendEmail(email, subject, message)
        console.log("this send email => ", a);

        res.status(200).json({
            success: true,
            message: `Reset password token has been send to ${email} successfully`,
            message1: message
        })
    } catch (e) {
        user.forgotPassword = undefined
        user.forgotPasswordToken = undefined
        return next(new AppError(e.message, 500))
    }

}








const resetPassword = async (req, res, next) => {
    const { resetToken } = req.params;
    const { password } = req.body

    console.log(resetToken);
    console.log(password);

    const forgotPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')


    const user = await User.findOne({
        forgotPasswordToken:resetToken,
        forgotPasswordExpiry: { $gt: Date.now() }
    });

    if (!user) {
        return next(new AppError("Token is invalid or expired , plese try again", 400))
    }


    user.password = password
    user.forgotPasswordToken = undefined
    user.forgotPasswordExpiry = undefined
    await user.save()

    res.status(200).json({
        success: true,
        message: "password changed successfully"
    })
}




export {
    register,
    login,
    logout,
    getProfile,
    forgotPassword,
    resetPassword

};