import customError from "../utils/customError.js";
import jwt from "jsonwebtoken"
import User from "../models/userModel.js";



export const isLoggedIn = async (req, res,next) => {
    try {
        // taking the token from either cookies or the authorization header
        const token = req.cookies.token || ((req.header.authorization) ? req.header.authorization.split(" ")[1] : undefined);
        
        // checking if token is undefined  or not - if it is undefined then send an error to the frontend
        if(!token){
            return next(new customError("Login first to access this page", 400));
        }
        
        // decoding the token using jsonwebtoken
        const {user_id} = jwt.verify(token , process.env.JWT_SECRET_KEY)

        // making a new property in the req object which user and it will be used by the next method of the route
        req.user  = await User.findById(user_id);

        // going to the next method in the route area by using next() function
        next();
    }
    catch(error){
        next(error);
    }


    
}

//method for checking the custom role
export const customRole = (...role) => {
    // it returns the reference to a function it self.
    return (req, res,next) => {
        if(role.includes(req.user.role)){
            next();
        }
        else{
            next(new customError("You are not allowed to proceed further",403));
        }
    }
}