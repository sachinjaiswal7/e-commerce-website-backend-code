import express from "express"
import {signup,
        login,
        logout,
        forgotPassword, 
        resetPassword, 
        showUserDashBoard,
        passwordUpdate,
        updateUserDetails, 
        adminAllUsers, 
        managerAllUsers, 
        adminGetOneUser,
        adminUpdateOneUserDetail,
        adminDeleteOneUser} from "../controllers/userController.js"

import { customRole, isLoggedIn } from "../middlewares/user.js";
const router = express.Router();


router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgotpassword").post(forgotPassword);
router.route("/password/reset/:token").post(resetPassword)
router.route("/userdashboard").get(isLoggedIn,showUserDashBoard);
router.route("/password/update").post(isLoggedIn , passwordUpdate)
router.route("/userdashboard/update").post(isLoggedIn , updateUserDetails)

//admin routes 
router.route("/admin/users").get(isLoggedIn ,customRole("admin"), adminAllUsers)
router.route("/admin/user/:id")
 .get(isLoggedIn,customRole("admin"),adminGetOneUser)
 .put(isLoggedIn,customRole("admin"),adminUpdateOneUserDetail)
 .delete(isLoggedIn,customRole("admin"),adminDeleteOneUser)

//manager routes 
router.route("/manager/users").get(isLoggedIn,customRole("manager"),managerAllUsers)







export default router