import jwt from "jsonwebtoken";
import AppError from "../utils/error.utils.js";

const isLoggedIn = async (req, res, next) => {
    const { token } = req.cookies;

    console.log(token + " isLogin");
    if (!token) {
        return next(new AppError("Unauthenticated, please log in again", 401));
    }

    try {
        const userDetails = jwt.verify(token, process.env.SECRET);
        req.user = userDetails;
        console.log(userDetails + " userdetails");
        next();
    } catch (error) {
        return next(new AppError("Token is invalid or expired", 401));
    }
};

export {
    isLoggedIn,
};
