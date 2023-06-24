import mongoose from "mongoose";

const connectDb = () => {
    const DB_URI = process.env.DB_URI;
    mongoose.connect(DB_URI,{
        dbName : "tshirtstore"
    }).then(() => {
        console.log("connected to the database");
    }).catch(err => {
        console.log("DB connection failed")
        console.log(err);
        process.exit(1);
    })
}


export default connectDb