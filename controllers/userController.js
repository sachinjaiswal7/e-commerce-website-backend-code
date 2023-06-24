import User from "../models/userModel.js"
import cloudinary from "cloudinary";
import customError from "../utils/customError.js";
import  cookieToken  from "../utils/cookieToken.js";
import fileUpload from "express-fileupload";
import addPhoto from "../utils/addPhoto.js";
import sendMail from "../utils/sendMail.js";
import deletePhoto from "../utils/deletePhoto.js";



export const signup = async (req, res,next) => {
  
   
    let photoOptions = undefined
    try{
        // keep track of the below written line you might have to change it in the future 
        const {photo} = req.files;
        // collecting input fields
        const {name, email, password} = req.body;

        // checking if any of the input field is undefined or null
        if(!name || !email || !password || !photo) return next(new customError("all fields are required" , 400)); 
        const options = {
            folder : "users",
            width : 300,
            crop : 'thumb'
        }

        // uploading the photo to the cloudinary 
        const resultPhoto = await addPhoto(photo.tempFilePath,options,next)
        photoOptions = {
            id : resultPhoto.public_id,
            secure_url : resultPhoto.secure_url
        }

        // creating the user in the DB
        const user = await User.create({name,email,password,photo : photoOptions})
        user.password = undefined;

        // sending the cookie to the front end
        cookieToken(user,res);
       
    }
    catch(error){
        if(photoOptions){
            const data = await cloudinary.v2.uploader.destroy(photoOptions.id,)
            console.log(data);
        }
        next(error)
    }

}



export const login = async (req , res, next) => {
    try{
        // taking the input of email and password 
    const {email, password} = req.body;

    // checking if the email and password are given or not 
    if(!email || !password){
        return next(new customError("Please provide all the fields",400));
    }
    
    // finding the user associated with the given email
    const user = await User.findOne({email});

    // if user doesn't exists in the DB then throw error 
    if(!user){
        return next(new customError("User doesn't exists",400));
    }

    // if users exits then go inside 
    else{
        // compare password
        const isMatched = await user.comparePassword(password);

        // if password is matched then send cookie to the front end 
        if(isMatched){
            return cookieToken(user,res);
        }
        // else throw error of incorrect email or password
        else{   
            return next(new customError("Incorrect email or password",400));
        }
    }
    }
    catch(error){
        next(error);
    }
}   



export const logout = async (req , res, next) => {
    res.status(200).cookie("token",null , {
        expires : new Date(Date.now()),
        httpOnly : true
    }).json({
        success : true,
        message : "Logout successful"
    })
}


export const forgotPassword =  async (req, res, next) => {
    let user = null;
    try{
        // taking the email field from the body
    const {email} = req.body;

    // finding the user associated to the given email
    user = await User.findOne({email});

    // if user doesn't exists execute the block of code;
    if(!user){
        return next(new customError("You are not registered",400));
    }

    // using the method defined in the modal of the user to create a unique string and set some fields of the user
    const uniqueString = user.resetForgotPasswordToken();
    user.save({validateBeforeSave : false})


    // creating url for changing the password 
    const urlForEmail = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${uniqueString}`
    // message of the email that we are about to send to the user
    const message = `Copy and paste the below given link in your browser \n\n ${urlForEmail}`;

    // options for the nodemailer 
    const options = {
        toEmail : email,
        subject : "change password",
        text: message 
    }
    
    // sending the mail to the user on given email
    await sendMail(options);

    // if the sending of email is successful then we get the response through the below code
    res.status(200).json({
        success : true,
        message : "Email sent successfully",
    }) 
    }
    catch(error){
        if(user){
        user.forgotPasswordToken = null;
        user.forgotPasswordExpiry = null;
        user.save({validateBeforeSave : false});
        }
        next(error);
    }

    
}


export const resetPassword = async(req ,res , next) => {
    try{
        // taking the token from the req.params, which we have set in the DB
        const {token} = req.params;
        // finding user according to the token
        const user = await User.findOne({forgotPasswordToken : token});

        // checking if user doesn't exists or token has been expired or not 
        if(!user || user.forgotPasswordExpiry < Date.now()){
            return next(new customError("Token is invalid or expired" , 400));
        }
        
        // taking the password and confirmPassword field from the req.body
        const {password , confirmpassword} = req.body;

        // checking if the both password match or not 
        if(password !== confirmpassword){
            return next(new customError("Both Passwords should be same" , 400));
        }
        // updating the password, forgotPasswordExpiry, forgotPasswordToken fields of the user 
        user.password = password;
        user.forgotPasswordExpiry = null
        user.forgotPasswordToken = null
        await user.save();

        res.status(200).json({
            success : true,
            message : "Password changed successfully",
        })
    }
    catch(error){
        next(error);
    }      
    

}


export const showUserDashBoard = (req, res,next) => {
    res.status(200).json({
        success : true,
        user : req.user
    })
}

export const passwordUpdate = async (req, res, next) => {
try{
    const user_id = req.user.id;
    const curUser = await User.findById(user_id).select("+password");
    const {oldpassword , newpassword} = req.body;
    const passwordMatched = await curUser.comparePassword(oldpassword)
    if(passwordMatched){
        curUser.password = newpassword;
        await curUser.save();
    }
    else{
        next(new customError("Old password is not correct", 400))
    }
    cookieToken(curUser,res);
}catch(err){
    next(err);
}
    
}


export const updateUserDetails = async(req, res, next) => {
try{
    if(!req.body.name){
        next(new customError("name is compulsory while updating the information" , 400));
    }
    const user_id = req.user.id;
    const fieldsToUpdate = {
        name : req.body.name,
    }
    if(req.files){
        const {photo} = req.files;
        const options = {
            folder : "users",
            width : 300,
            crop : 'thumb'
        }

        // uploading the photo to the cloudinary 
        const resultPhoto = await addPhoto(photo.tempFilePath,options,next)
        fieldsToUpdate.photo = {
            id : resultPhoto.public_id,
            secure_url : resultPhoto.secure_url
        }
        await deletePhoto(req.user.photo.id,next);


    }
    const userWithNewDetails = await User.findByIdAndUpdate(user_id,fieldsToUpdate,{new : true,runValidators : true})
    res.status(200).json({
        success : true,
        user : userWithNewDetails,
        message : "updated detailes"
    })
}catch(err){
    next(err);
}

}

export const adminAllUsers = async(req,res, next) => {
try{
    const users = await User.find();
    res.status(200).json({
        success : true,
        users,
        message : "users found successfully"
    })
}catch(err){
    next(err);
}
}

export const managerAllUsers = async(req, res, next) => {
try{
    //finding only those users who have the role as user this is a controller which limits that which type of users the manager can access from Data Base.
    const users = await User.find({role : "user"});
    res.status(200).json({
        success : true,
        users,
        message : "found successfully"
    })
}catch(err){
    next(err);
}
}


// method to get one user from the database and this method can be used by only admin users.
export const adminGetOneUser = async(req, res, next) => {
try{
    const {id} = req.params;
    const user = await User.findById(id);
    if(user){
        res.status(200).json({
            success : true,
            user,
            message : "user found",
        })
    }
    else next(new customError("There is no user with given id" , 400));
}catch(err){
    next(err);
}
}


export const adminUpdateOneUserDetail = async(req, res, next) => {
    try{
        if(!req.body.name){
            next(new customError("name is compulsory while updating the information" , 400));
        }
        const user_id = req.params.id;
        const fieldsToUpdate = {
            name : req.body.name,
            role : req.body.role
        }
       
        const userWithNewDetails = await User.findByIdAndUpdate(user_id,fieldsToUpdate,{new : true,runValidators : true})
        res.status(200).json({
            success : true,
            user : userWithNewDetails,
            message : "updated detailes"
        })
    }catch(err){
        next(err);
    }
}

export const adminDeleteOneUser = async(req, res, next) =>  {
try{
    const {id} = req.params;
    // finding the user as per id provided in the params 
    const user = await User.findById(id);
    if(!user){
        return next(new customError("no user found with this id", 400));
    }

    //checking if the user which is to be deleted is not admin 
    if(user.role !== 'admin'){
        await User.findByIdAndDelete(id);
        await deletePhoto(user.photo.id,next)
        res.status(200).json({
            success : true,
            message : "User deleted successfully",
            user
        })
    }
    else{
        next(new customError("You are not allowed to delete admins" , 400));
    }
}catch(err){
    next(err);
}


}