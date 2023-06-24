import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs"
import jwt  from "jsonwebtoken";
import { nanoid } from "nanoid";


const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true, "Please provide a name"],
        maxlength : [40 , "Name should be less than or equal to 40 character"]
    },
    email  : {
        type : String,
        required : [true, "Please provide an name"],
        maxlength : [40 , "email should be less than or equal to 40 character"],
        validate : [validator.isEmail,"Write a valid email"],
        unique : true
    },
    password : {
        type : String,
        required : [true, "Please provide a password"],
        validate : [validator.isStrongPassword, "Enter a strong password"],
        maxlength : [30, "Password  should upto 30 characters"],
        select : false
    },
    role : {
        type : String,
        default : "user"
    },
    photo : {
        id : {
            type : String,
            required : true
        },
        secure_url : {
            type : String,
            required: true
        }
    },
    forgotPasswordToken : {
       type :  String,
       default : null
    },
    forgotPasswordExpiry : {
        type : Date,
        default : null
    },
    createdAt : {
        type : Date,
        default : Date.now,
    }
    
})

// pre hook used to encrypt the password right before the saving of the creation of the user and - at only the times when the password is modified 
userSchema.pre("save" , async function(next){
    if(!this.isModified("password"))return next();
    this.password = await bcrypt.hash(this.password,10);
    next();
})

// validate the password with the new given password 
userSchema.methods.comparePassword = async function(userSentPassword){
    const User = mongoose.model('User');
    const user = await User.findOne({email : this.email}).select("+password");
    // console.log("the user is " + " " + user);
    const match =  await bcrypt.compare(userSentPassword , user.password);
    return match;
}

// returns a jwt token which is made up of id of the user in the database
userSchema.methods.getToken = function(){
    return  jwt.sign({user_id : this._id} , process.env.JWT_SECRET_KEY, {
        expiresIn : process.env.JWT_EXPIRY
    })
}

// returning a random string using a library called as nanoid for reseting the password
userSchema.methods.resetForgotPasswordToken =  function(){
    // here instead of nanoid you need to use a powerful cryptographic function in the production of your application 
    const str =  nanoid();
    this.forgotPasswordToken = str;
    
    // setting the expiry of the token 
    this.forgotPasswordExpiry = Date.now()+  1000 * 60 * 20;
    
    return str;
}





const User = mongoose.model("User",userSchema);
export default User;