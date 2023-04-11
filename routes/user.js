const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
// const bodyParser = require("body-parser");
const db = require("../model/connection");
const auth = require("../controller/auth");

const { body, validationResult } = require("express-validator");
const adminController = require("../controller/adminController");
const verifyLogin = require("../controller/auth");
/* GET home page. */
router.get("/", userController.home);
// GET sign up//

router.get("/signup", userController.getUserSignup);

// POST sign up//

router.post("/signup", userController.postUsersignup);

//GET LOGIN//

router.get("/login", userController.getUsersLogin);

//POST LOGIN//

router.post("/login", userController.postUserSignin);
//LOGOUT//
router.get("/logout", userController.getUserlogout);
//SHOP//
router.get("/shop", verifyLogin.verifyLogin, userController.shopPage);
//VIEW-PRODUCT//
router.get("/view-product", userController.getProductPage);
//CART//
router.get("/cart", verifyLogin.verifyLogin, userController.Cart);
//EMPTY CART
router.get("/emptyCart", verifyLogin.verifyLogin, userController.EmptyCart);
//add To Cart//
router.get("/add-to-cart/:id", userController.getAddToCart);
//delete  Cart//
// router.post("/delete_cart/:id",userController.deleteCartProduct)

//change Product quantity
router.post("/change-product-quantity", userController.changeProductQuantity);
//remove from Cart
router.delete("/remove-cart", userController.removeCart);
//order page
router.get("/order", verifyLogin.verifyLogin, userController.getOrder);
//Place Order
router.post("/order", userController.placeOrder);
//Order Success:
router.get(
  "/order-success",
  verifyLogin.verifyLogin,
  userController.orderSucesss
);
//Order Success: post
router.post("/cancel-order", userController.cancelOrder);
//filter product
router.get("/filter/:id", userController.filterProduct);
//address
router.delete("/delete-address/:id", userController.deleteAddress);
//profile page
router.get("/profile", userController.getprofilePage);
///verify_payment
router.post("/verify_payment",userController.verifypayment)
module.exports = router;
