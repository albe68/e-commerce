const express = require("express");
const router = express.Router();
// const bodyParser = require("body-parser");
const db = require("../model/connection");
const auth = require("../controller/auth");
const { body, validationResult } = require("express-validator");
const userController = require("../controller/userController");
const adminController = require("../controller/adminController");
const verifyLogin = require("../controller/auth");
const productController = require("../controller/productController");
const cartController = require("../controller/cartController");
const orderController = require("../controller/orderController");
const wishlistController = require("../controller/wishlistController");

//SIGNUP
router.get("/signup", userController.getUserSignup);
router.post("/signup", userController.postUsersignup);

//user login
router.get("/login", userController.getUsersLogin);
router.post("/login", userController.postUserSignin);
router.get("/logout", userController.getUserlogout);

//otp services
router.get("/otp-login", userController.getUserOtpLogin);
router.post("/otp-login", userController.postUserOtpLogin);
router.get("/otp_verify", userController.getOtpVerify);
router.post("/otp_verify", userController.postOtpVerify);

//VIEW-PRODUCT//
router.get("/", userController.home);
router.get("/shop", verifyLogin.verifyLogin, userController.shopPage);
router.get("/view-product/:id", productController.getProductPage);
router.get("/filter/:id", productController.filterProduct);
router.post("/search", productController.getSearch);
router.post("/sort", productController.sortProducts);
//dark mode
router.patch("/dark-mode", userController.darkMode);

//CART//
router.get("/cart", verifyLogin.verifyLogin, cartController.Cart);
router.get("/check-cart-quantity/:id", cartController.checkCartQuantity);
router.get("/emptyCart", verifyLogin.verifyLogin, cartController.EmptyCart);
router.get("/add-to-cart/:id", cartController.getAddToCart);
router.post("/change-product-quantity", cartController.changeProductQuantity);
router.delete("/remove-cart", cartController.removeCart);

//ORDER
router.get("/order", verifyLogin.verifyLogin, orderController.getOrder);
router.post("/order", orderController.placeOrder);
router.get(
  "/order-success",
  verifyLogin.verifyLogin,
  orderController.orderSucesss
);
router.post("/cancel-order", orderController.cancelOrder);
router.post("/verify_payment", orderController.verifypayment);
// router.post("/verify_coupon", orderController.verifyCoupon);

//  wISHLIST

router.get("/add_to_wishlist/:id", wishlistController.addToWishlist);
router.get("/wishlist", wishlistController.getWishlist);
router.delete("/wishlist/remove/:id", wishlistController.deleteWishlist);

//profile page
router.get("/profile", userController.getprofilePage);
router.post("/change-passsword", userController.changePassword);
router.delete("/delete-address/:id", userController.deleteAddress);

module.exports = router;
