import Order from "../models/orderModel.js"
import Product from "../models/productModel.js"
import customError from "../utils/customError.js"

export const createOrder = async (req, res, next) => {
try{
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        taxAmount,
        shippingAmount,
        totalAmount,
    }  = req.body

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        taxAmount,
        shippingAmount,
        totalAmount,
        user : req.user._id
    })

    res.status(200).json({
        success : true,
        order
    })
}catch(err){
    next(er);
}
    
}

export const getOneOrder = async(req, res, next) => {
try{
    const {orderId} = req.params
    // finding the order with adding some more fields of the user itself by using the popule method of the mongoose
    const order = await Order.findById(orderId).populate({
        path : "user",
        select : "name email"
    });
    if(!order){
        return next(new customError("There are no order available with ths id",400));
    }
    res.status(200).json({
        success : true,
        order
    })
}catch(err){
    next(err);
}
}


export const getLoggedInOrders = async(req, res, next) => {
try{
    const userId = req.user._id;
    const allOrders = await Order.find({user : userId});

    res.status(200).json({
        success : true,
        allOrders
    })
}catch(err){
    next(err);
}

}

// this method is only for admin to update only orderStatus of an order placed by the customer
export const adminGetAllOrders = async(req, res, next) => {
try{
    const orders = await Order.find();
    res.status(200).json({
        success  : true,
        orders
    })
}catch(err){
    next(err);
}
}

export const adminUpdateOneOrder = async(req, res, next) => {
try{
    const order = await Order.findById(req.params.orderId);
    if(!order){
        return next(new customError("There is no order with given id"), 400);
    }
    if(order.orderStatus === 'Delivered'){
        return next(new customError("The order is already marked delivered"), 401);
    }

    //changing the orderStatus and saving it in the database 
    order.orderStatus = req.body.orderStatus;
    await order.save({validateBeforeSave : false});


    //handling the stock of a product which has been delivered 
    if(req.body.orderStatus === "Delivered"){
        const orderItems = order.orderItems;
        for(let i = 0;i < orderItems.length;i++){
            await updateProductStock(orderItems[i].product,orderItems[i].quantity);
        }
    }


    res.status(200).json({
        success : true,
        order
    })
}catch(err){
    next(err);
}
}

export const adminDeleteOneOrder = async(req, res, next) => {
try{
    const order = await Order.findById(req.params.orderId);
    if(!order){
        return next(new customError("There is no order associated with given id", 400));
    }
    await order.deleteOne();
    res.status(200).json({
        success : true,
        message : "Order deleted Successfully"
    })
}catch(err){
    next(err);
}
}

// method to update the stock of a product when the product has been delivered it is used in the above function named as (adminUpdateOneOrder)
async function updateProductStock(productId, quantity){
    const product = await Product.findById(productId);
    product.stock = product.stock - quantity;
    await product.save({validateBeforeSave : false});
}


