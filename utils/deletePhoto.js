import cloudinary from "cloudinary";
const deletePhoto = async (public_id,next) => {
    try{
      await cloudinary.v2.uploader.destroy(public_id);
    }
    catch(err){
        next(err);
    }

}
export default deletePhoto;