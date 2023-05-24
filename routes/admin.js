var express = require("express");
var router = express.Router();
var auth=require("../controller/auth")
const multer = require("../middleware/multer/multer");
const uploads = require("../middleware/multer/multer")




const adminController=require("../controller/adminController");
const { admin } = require("../model/connection");
/* GET users listing. */
router.get("/",adminController.getAdminPanel);
/*GET users login*/
router.get("/login",adminController.getAdminLogin)


// Post Admin Login Router//
router.post("/login", adminController.postAdminlogin);
router.get("/logout",adminController.getAdminLogout)


router.get('/products',auth.verifyAdmin,adminController.Products)
//add product//
router.get("/add-product",auth.verifyAdmin,adminController.getAddProducts);

// ,upload.single('image')
router.post("/add-products",auth.verifyAdmin,multer.uploads,adminController.postAddProduct);


//edit product//
router.get("/products/edit-product/:id",auth.verifyAdmin,adminController.getEditProducts);
router.post("/products/edit_product/:id",auth.verifyAdmin,multer.editeduploads,adminController.postEditProducts);

//delete product//
router.get("/products/delete_product/:id",auth.verifyAdmin,adminController.getdeleteProducts)
router.get("/products/list_product/:id",auth.verifyAdmin,adminController.getListProducts)


//USERS
router.get('/users',auth.verifyAdmin,adminController.Users)
router.get('/users/block_user/:id',auth.verifyAdmin,adminController.blockUser);
router.get('/users/unblock_user/:id',auth.verifyAdmin,adminController.unblockUser);
//CATEGORY

// Get Category Router//

router.get('/category',auth.verifyAdmin,adminController.getCategory);

// Add Category Router//

router.post('/category/add-categories',auth.verifyAdmin,adminController.addCategory);

// Delete Category Router//

router.get('/category/delete_category/:id',auth.verifyAdmin,adminController.deleteCategory);

// Edit Category Router//

router.get('/category/edit_categories/:id',auth.verifyAdmin,adminController.editCategory);

// Edit Category Router//

router.post('/category/edit_categories/:id',auth.verifyAdmin,adminController.updateCategory);
//Order Management //
router.get('/orders',auth.verifyAdmin,adminController.getAdminOrders)
//Update Order//
router.put('/orders/update-order',auth.verifyAdmin,adminController.updateOrder)
//Sales report
router.get("/sales_report",auth.verifyAdmin,adminController.getSalesReport) 
router.post("/sales_report",auth.verifyAdmin,adminController.postSalesReport)

//coupon management
router.get("/generate_coupon",auth.verifyAdmin,adminController.generateCoupon)
router.get("/coupon_management",auth.verifyAdmin,adminController.getCoupon)
router.get("/add-coupon",auth.verifyAdmin,adminController.getAddCoupon)

router.post("/add_coupon",auth.verifyAdmin,adminController.postAddCoupon)
module.exports = router;
