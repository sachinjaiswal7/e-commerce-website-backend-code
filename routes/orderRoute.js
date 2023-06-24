import express from "express"
import { customRole, isLoggedIn } from "../middlewares/user.js";
import { adminDeleteOneOrder, adminGetAllOrders, adminUpdateOneOrder, createOrder, getLoggedInOrders, getOneOrder } from "../controllers/orderController.js";


const router = express.Router();

router.route("/order/create").post(isLoggedIn,createOrder)
router.route("/order/all").get(isLoggedIn,getLoggedInOrders);
router.route("/order/getone/:orderId").get(isLoggedIn,getOneOrder);


//admin routes 
router.route("/admin/order/all").get(isLoggedIn,customRole("admin"),adminGetAllOrders);
router.route("/admin/order/updateorder/:orderId").put(isLoggedIn,customRole("admin"),adminUpdateOneOrder);
router.route("/admin/order/deleteorder/:orderId").delete(isLoggedIn,customRole("admin"),adminDeleteOneOrder);




export default router;