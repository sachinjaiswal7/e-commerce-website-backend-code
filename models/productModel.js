import mongoose from "mongoose";

const Schema = new mongoose.Schema({
    name : {
        type : String,
        required : [true , "Name field can't be empty"],
        trim : true,
        maxlength : [120 , "exceeds the limit of number of character which is 120"]
    },
    price :{
        type : Number,
        requried : [true , "Price of the product is needed"],
        maxlength : [5 , "Price should be more than 5"]
    },
    description:{
        type : String,
        required : [true , "Please provide product description"]
    },
    photos : [
        {
            id : {
                type : String,
                required : [true , "give the public_id of the image "],
            },
            secure_url :{
                type : String,
                required : [true ,"give the secure_url of the image"]
            }
        }
    ],
    stock : {
        type : Number,
        required : true
    },
    category : {
        type : String,
        required : [true , "please select one of the category from shortsleeves , longsleeves , sweatshirts, hoodies"],
        enum : {
            values : [
                "shortsleeves",
                "longsleeves",
                "sweatshirts",
                "hoodies"
            ],
            message : "please select one of the category from shortsleeves , longsleeves , sweatshirts, hoodies"
        }
    },
    brand : {
        type : String,
        required : [true , "please provide a brand"],
    },
    rating : {
        type : Number,
        default : 0
    },
    numberOfReviews : {
        type : Number,
        default : 0
    },
    ratingSum : {
        type : Number,
        default : 0
    },
    reviews : [
        {
            user : {
                type : mongoose.Schema.Types.ObjectId,
                ref : "User",
                required : true 
            },
            name : {
                type : String,
                required : true
            },
            rating : {
                type : Number,
                required : true
            },
            comment : {
                type : String,
                required : true
            }
        }
    ],
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    createdAt:{
        type : Number,
        default : Date.now,
    }
})


const Product = mongoose.model("Product" , Schema);
export default Product;