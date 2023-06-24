import Product from "../models/productModel.js"
import customError from "../utils/customError.js"
import cloudinary from "cloudinary"
import  WhereClause  from "../utils/whereClause.js"


export const adminAddProduct = async(req, res,next) => {
    let photos = []
try{

    // taking all the fields from the req.body
    

    // checking if photos are coming or not 
    if(!req.files){
        return next(new customError("At least one photo is required ", 400));
    }
    if(!Array.isArray(req.files.photos))photos.push(req.files.photos)
    else photos = req.files.photos
    // checking if any of the file is undefined or not
    if(!name || !price || !description || !photos || !category || !brand){
        return next(new customError("All fields of a Product are required", 400));
    }
   
    // uploading given photos of the product and saving their public_id and secure_url in photos array which will be passed while creating new Product
    for(let i = 0;i < photos.length;i++){
       const uploadedPhoto = await cloudinary.v2.uploader.upload(photos[i].tempFilePath,{
            folder : "products",
        })
        photos[i] = {
            id : uploadedPhoto.public_id,
            secure_url : uploadedPhoto.secure_url
        }
        
    }
    
    req.body.user = req.user;
    // adding the product to the database
    const product = await Product.create(req.body);
    res.status(200).json({
        success : true,
        message : "Product added successfully",
        product
    })

}catch(err){
    for(let i = 0;i < photos.length;i++){
        await cloudinary.v2.uploader.destroy(photos[i].id)
    }
    next(err);
}
}


export const searchProduct = async (req, res, next) => {
try{
    // counting the number of products in the dataabase before filter the products 
    const countBeforeFilter = await Product.countDocuments();

    // number product per page 
    const resultPerPage = 6;

    // 
    const bigQ = req.query

    //filtering the produtcs 
    let products =  new WhereClause(Product.find(),bigQ);
    products = products.search().filter();

    // counting the number products after filtering the products 
    const countAfterFilter = (await products.base.clone()).length;
    
    // finding the  products per page using pagination method of WhereClause class
    products =   products.pagination(resultPerPage)
    products = await products.base;


   
    res.status(200).json({
        success : true,
        products,
        countBeforeFilter,
        countAfterFilter
    })
}catch(err){
    next(err);
}


}


export const getOneProduct = async(req, res, next) => {

try{
    if(req.params && req.params.id){
        const product = await Product.findById(req.params.id)
        res.status(200).json({
            success : true,
            product
        })
    }
    else{
        next(new customError("Please provide the correct Id of the product" , 400));
    }
}catch(err){
    next(err);
}
}

export const adminGetAllProduct = async(req, res, next) => {

try{
    const products = await Product.find();

    res.status(200).json({
        success : true,
        products
    })
}catch(err){
    next(err);
}

}

export const adminUpdateOneProduct = async(req, res, next) => {
    let photos = [];
    let rawPhotos  = [];
try{
    
    //finding the product from the database according to the given id in the params 
    let product = await Product.findById(req.params.id)
    if(!product){
        next(new customError("No product available with this Id" , 400));
    }



    if(req.files && req.files.photos){
        //deleting previous photos of the product from the cloudinary
        for(let i = 0;i < product.photos.length;i++){
            await cloudinary.v2.uploader.destroy(product.photos[i].id);
        }



        //adding new photos of the product to the cloudinary
        if(!Array.isArray(req.files.photos))rawPhotos.push(req.files.photos)
        else rawPhotos = req.files.photos


        for(let i =0 ;i < rawPhotos.length;i++){
            const resultOfPhoto = await cloudinary.v2.uploader.upload(rawPhotos[i].tempFilePath,{
                folder : "products"
            })
            
            const obj = {
                id : resultOfPhoto.public_id,
                secure_url : resultOfPhoto.secure_url
            }
            photos.push(obj);
        }
        req.body.photos = photos
    }
    else{
        next("Please provide at least one photo of the product")
    }
    
    //updating the product
     product = await Product.findByIdAndUpdate(req.params.id , req.body,{
        new : true,
        runValidators : true
     })

    res.status(200).json({
        success : true,
        product,
    })
    



}catch(err){
    for(let i = 0;i < photos.length;i++){
        await cloudinary.v2.uploader.destroy(photos[i].id);
    }
    next(err);
}
}

export const adminDeleteOneProduct = async(req, res, next) => {
try{
    const product = await Product.findById(req.params.id);
    if(!product){
        next(new customError("There is no product with the given Id",400))
    }
    for(let i = 0;i < product.photos.length;i++){
        await cloudinary.v2.uploader.destroy(product.photos[i].id);
    }
    await product.deleteOne();
    

    res.status(200).json({
        success : true,
        message : "Product delete successfully"
    })
}
catch(err){
    next(err);
}
    
}


// methods for reviews
export const addReview = async(req, res,next) => {
try{
    req.body.user = req.user._id;
    req.body.name = req.user.name
    // reading properties 
    const{rating,comment} = req.body;

    // checking if any of the property is null or not 
    if(!rating || !comment){
        return next(new customError("Rating and Comment are required to give review",400));
    }
    
    //finding the product associated with given id 
    let product = await Product.findById(req.params.productId);

    // checking if product is not null
    if(!product){
        return next(new customError("There is no product with given Id",400));
    }


    //updating important stuff 
    let reviewArray = product.reviews
    let idx = -1;
    for(let i = 0;i < reviewArray.length;i++){
        if(reviewArray[i].user.equals(req.user.id)){
            idx = i;
            break;
        }
    }
    let add = Number(rating);
    let sub = 0;
    let numberOfReviews = product.numberOfReviews;
    let ratingSum = product.ratingSum
    if(idx === -1){
        numberOfReviews++;
    }
    else{
        sub = reviewArray[idx].rating;
    }

    add -= sub;
    ratingSum += add;
    product.rating = ratingSum / numberOfReviews  // updating the rating of the product 
    product.numberOfReviews = numberOfReviews;  // updating the numberOfReviews of the product
    product.ratingSum = ratingSum;              // updating the ratingSum property of the product
    if(idx === -1){
      product.reviews.push(req.body);
    }
    else{
        product.reviews[idx] = req.body;
    }

    // saving this product
    await product.save({validateBeforeSave:false});
    

    


    res.status(200).json({
        success : true,
        review : req.body
    })





}catch(err){
    next(err);
}

}

export const deleteReview = async(req, res, next) => {
try{
    const product = await Product.findById(req.params.productId);
    if(!product){
        return next(new customError("There is no product with given id", 400));
    }

    const alreadyReview = product.reviews;
    let idx = -1;
    // finding the current users review in the reviews array of the product
    for(let i = 0 ;i < alreadyReview.length;i++){
        if(alreadyReview[i].user.equals(req.user._id)){
            idx = i;
            break;
        }
    }
    
    // if there is no review for the current user then through an error
    if(idx == -1){
        return next(new customError("There is no review associated with your id", 400));
    }
    // else delete the current users review from the reviews array of the product
    else{
        let ratingToRemove = alreadyReview[idx].rating;
        product.reviews.splice(idx , 1); // remove one element which is at the index -> idx
        product.ratingSum = product.ratingSum - ratingToRemove;
        product.numberOfReviews = product.reviews.length;
        product.rating = (product.ratingSum / product.numberOfReviews);
    }
    await product.save({validateBeforeSave : false});

    res.status(200).json({
        success : true,
        message : "Review deleted successfully"
    })

}catch(err){
    next(err);
}

}

export const getOnlyReviewsForOneProduct = async(req, res, next) => {
try{
    const product = await Product.findById(req.query.productId);
    if(!product){
        return next(new customError("There is no product with given id", 400));
    }

    res.status(200).json({
        success : true,
        reviews : product.reviews
    })
}catch(err){
    next(err);
}
}




export const sendRazorPayKey = (req, res, next) => {
    res.status(200).json({
        success : true,
        RAZORPAY_API_KEY : process.env.RAZORPAY_API_KEY,
    })
}

export const captureRazorpayPayment = async(req, res, next) => {
    var instance = new Razorpay({ key_id: process.env.RAZORPAY_API_KEY, key_secret: process.env.RAZORPAY_SECRET_KEY })

   const myOrder =  await instance.orders.create({
    amount: req.body.amount,
    currency: "INR",
    })

    res.status(200).json({
        success : true,
        myOrder
    })


}