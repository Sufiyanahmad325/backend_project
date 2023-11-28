import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import crypto from "crypto"


const userSchema = new Schema({
    fullName: {
        type: String, // Use "String" instead of "String" in quotes
        required: [true, "Name is required"],
        minLength: [5, "Name must be at least 5 characters"],
        maxLength: [50, "Name should be less than 50 characters"],
        lowercase: true,
        trim: true
    },
    email: {
        type: String, // Use "String" instead of "String" in quotes
        required: [true, "Email is required"],
        lowercase: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minLength: [8, "Password must be at least 8 characters"],
        select: false
    },
    avatar: {
        public_id: {
            type: String
        },
        secure_url: {
            type: String
        }
    },
    role: {
        type: String,
        enum: ['USER', 'ADMIN'],
        default: 'USER'
    },
    forgotPassword: String,
    forgotPasswordExpiry: Date
}, {
    timestamps: true
});

userSchema.pre('save', async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods = {
    generateJWTToken: async function () {
        return jwt.sign(
            { id: this._id, email: this.email, role: this.role },
            process.env.SECRET,
            {
                expiresIn: process.env.JWT_EXPIRY,
            }
        );
    },
    comparePassword: async function (plainTextPassword) {
        return bcrypt.compare(plainTextPassword, this.password);
    },

    generatePasswordResetToken:async function(){
        const resetToken = crypto.randomBytes(20).toString("hex") //crypto ka method hai randomBytes iske under ham jitna bhi number denge utne bytes ka ye number dega 
        this.forgotPasswordToken = crypto.createHash('sha256')
        .update(resetToken)
        .digest('hex')
        this.forgotPasswordExpiry= Date.now() + 15*60*1000

        return resetToken;
    }
};





const User = model("UserBackEnd", userSchema)

export default User