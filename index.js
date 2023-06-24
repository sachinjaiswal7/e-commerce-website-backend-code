import app from "./app.js";
const PORT = process.env.PORT;
import cloudinary from "cloudinary"
import  connectDb  from "./config/database.js";

// connecting the database
connectDb();


cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  }) 

app.listen(PORT , () => {
    console.log(`Server is running on port ${PORT}`);
})

