import cloudinary from "cloudinary"

const addPhoto = async (tempFilePath , options,next) => {
    try{
    const resultPhoto = await cloudinary.v2.uploader.upload(tempFilePath,options)
    return resultPhoto;
    }
    catch(error){
        next(error);
    }
}

export default addPhoto