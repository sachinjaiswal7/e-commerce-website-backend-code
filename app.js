import express from "express"
import {config} from "dotenv"
import morgan from "morgan"
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
// importing all the routes 
import homeRouter from "./routes/homeRoute.js"
import userRouter from "./routes/userRoute.js"
import productRouter from "./routes/productRoute.js"
import paymentRouter from "./routes/paymentRouter.js"
import orderRouter from "./routes/orderRoute.js"




config({
    path : "./config/config.env"
})


const app = express();


// regular middlewares 
app.use(express.urlencoded({extended : true}))
app.use(express.json());

// cookies and file middlewares
app.use(cookieParser());
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : "/tmp/"
}));
// morgan middleware - always keep in mind morgan should come before any routes of you application
app.use(morgan("tiny"));




// router  middlewares 
app.use("/api/v1",homeRouter);
app.use("/api/v1/", userRouter);
app.use("/api/v1", productRouter)
app.use("/api/v1",paymentRouter);
app.use("/api/v1",orderRouter);


app.get("/",(req,res) => {
    res.render("frontend.ejs");
})


// middleware for error by defining the below code we can pass an error to the next function and it will handle the error and all
app.use((err,req, res, next) => {
    let message = err.message;
    let statusCode = err.statusCode;
    console.log(err);
    if(!message || message == '')message = "Internal server error";
    if(!statusCode)statusCode = 500;
   return  res.status(statusCode).json({
        success : false,
        message
    })
    
})


export default app