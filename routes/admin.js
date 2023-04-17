var express = require("express");
var router = express.Router();
var auth=require("../controller/auth")
// 11-04-23 commented
// const multer  = require('multer')

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//       cb(null, 'public/uploads/') 
//       //  had put ./ before public
//   },
//   filename: function (req, file, cb) {            //file name of the image uploaded file
//       const uniqueSuffix = Date.now() + '-' + file.originalname 
//       cb(null, file.fieldname + '-' + uniqueSuffix)
//   }
// })

// const upload = multer({ storage: storage })



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
router.post("/add-products",adminController.postAddProduct);


//edit product//
router.get("/products/edit-product/:id",auth.verifyAdmin,adminController.getEditProducts);
router.post("/products/edit_product/:id",adminController.postEditProducts);

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


module.exports = router;
