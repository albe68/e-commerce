const express = require("express");
const router = express.Router();
const userController=require("../controller/userController")
// const bodyParser = require("body-parser");
const db=require("../model/connection")
const auth=require("../controller/auth")


const { body, validationResult } = require('express-validator');
const adminController = require("../controller/adminController");

// router.post('/login',
//     body('email').isEmail().normalizeEmail(),
//     body('password').isLength({
//         min: 6
//     }),
//     (req, res) => {
//         const errors = validationResult(req);

//         if (!errors.isEmpty()) {
//             return res.status(400).json({
//                 success: false,
//                 errors: errors.array()
//             });
//         }

//         res.render("admin/admin-dashboard")
//         res.status(200).json({
//             success: true,
//             message: 'Login successful',

//         })
//     });




/* GET home page. */
router.get("/",userController.home)
// GET sign up//

router.get("/signup",userController.getUserSignup);

// POST sign up//

router.post("/signup",userController.postUsersignup);

//GET LOGIN//

router.get("/login",userController.getUsersLogin)

//POST LOGIN//

router.post("/login",userController.postUserSignin)
//LOGOUT//  
router.get("/logout",userController.getUserlogout)
//SHOP//
router.get("/shop",userController.shopPage)
//VIEW-PRODUCT//
router.get('/view-product',userController.getProductPage)
//CART//
router.get("/cart",userController.Cart)
//EMPTY CART
router.get("/emptyCart",userController.EmptyCart)
//add To Cart//
router.get("/add-to-cart/:id",userController.getAddToCart)
//delete  Cart//
// router.post("/delete_cart/:id",userController.deleteCartProduct)

//change Product quantity
router.post("/change-product-quantity",userController.changeProductQuantity)
//remove from Cart
router.delete('/remove-cart',userController.removeCart)
//order page
router.get('/order',userController.Order)


module.exports = router;
