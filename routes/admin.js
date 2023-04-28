var express = require("express");
var router = express.Router();
var auth=require("../controller/auth")
const multer = require("../middleware/multer/multer");
const uploads = require("../middleware/multer/multer")




const adminController=require("../controller/adminController");
const { admin } = require("../model/connection");

router.get("/",adminController.getAdminPanel);
/* GET users listing. */
-router.get("/login",adminController.getAdminLogin)


// Post Admin Login Router//
router.post("/login", adminController.postAdminlogin);
router.get("/logout",adminController.getAdminLogout)


router.get('/products',auth.verifyAdmin,adminController.Products)
//add product//
router.get("/add-product",auth.verifyAdmin,adminController.getAddProducts);

// ,upload.single('image')
router.post("/add-products",multer.uploads,adminController.postAddProduct);


//edit product//
router.get("/products/edit-product/:id",auth.verifyAdmin,adminController.getEditProducts);
router.post("/products/edit_product/:id",auth.verifyAdmin,multer.editeduploads,adminController.postEditProducts);

//delete product//
router.get("/products/delete_product/:id",adminController.getdeleteProducts)
router.get("/products/list_product/:id",adminController.getListProducts)


//USERS
router.get('/users',auth.verifyAdmin,adminController.Users)
router.get('/users/block_user/:id',adminController.blockUser);
router.get('/users/unblock_user/:id',adminController.unblockUser);
//CATEGORY

// Get Category Router//

router.get('/category',auth.verifyAdmin,adminController.getCategory);

// Add Category Router//

router.post('/category/add-categories',auth.verifyAdmin,adminController.addCategory);

// Delete Category Router//

router.get('/category/delete_category/:id',adminController.deleteCategory);

// Edit Category Router//

router.get('/category/edit_categories/:id',auth.verifyAdmin,adminController.editCategory);

// Edit Category Router//

router.post('/category/edit_categories/:id',adminController.updateCategory);
//Order Management //
router.get('/orders',adminController.getAdminOrders)
//Update Order//
router.put('/orders/update-order',adminController.updateOrder)
//Sales report
router.get("/sales_report",adminController.getSalesReport) 
router.post("/sales_report",adminController.postSalesReport)

//coupon management
router.get("/generate_coupon",adminController.generateCoupon)
router.get("/coupon_management",adminController.getCoupon)

router.post("/add-coupon",adminController.addCoupon)
module.exports = router;
