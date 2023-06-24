import express from "express"
import { customRole, isLoggedIn } from "../middlewares/user.js";
import { addReview, adminAddProduct, adminDeleteOneProduct, adminGetAllProduct, adminUpdateOneProduct, deleteReview, getOneProduct, getOnlyReviewsForOneProduct, searchProduct } from "../controllers/productController.js";

const router = express.Router();

//admin routes 
router.route("/admin/product/add").post(isLoggedIn,customRole("admin"),adminAddProduct)
router.route("/admin/product/all").get(isLoggedIn , customRole("admin") , adminGetAllProduct);
router.route("/admin/product/update/:id").put(isLoggedIn, customRole("admin"),adminUpdateOneProduct)
router.route("/admin/product/delete/:id").delete(isLoggedIn,customRole("admin"),adminDeleteOneProduct)



//user routes
router.route("/product/search").get(searchProduct);
router.route("/product/getoneproduct/:id").get(getOneProduct);
router.route("/product/review/:productId").put(isLoggedIn,addReview).delete(isLoggedIn,deleteReview);
router.route("/product/review/all").get(isLoggedIn,getOnlyReviewsForOneProduct);







export default router;