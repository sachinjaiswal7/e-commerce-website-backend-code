import express from "express";
import { isLoggedIn, customRole} from "../middlewares/user.js";
import { captureRazorpayPayment, sendRazorPayKey } from "../controllers/productController.js";


const router = express.Router();

// send api_key of our razorpay
router.route("razorpaykey").get(isLoggedIn,sendRazorPayKey)

//payment capture route 
router.route("capturerazorpaypayment").post(isLoggedIn,captureRazorpayPayment);

export default router