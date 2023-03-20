var express = require("express");
var router = express.Router();
var auth=require("../controller/auth")

const multer  = require('multer')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'public/uploads/')
  },
  filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + file.originalname
      cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})

const upload = multer({ storage: storage })



const adminController=require("../controller/adminController");
const { admin } = require("../model/connection");

router.get("/",adminController.getAdminPanel);
/* GET users listing. */
router.get("/login",adminController.getAdminLogin)


// Post Admin Login Router//
router.post("/login", adminController.postAdminlogin);
router.get("/logout",adminController.getAdminLogout)


router.get('/products',auth.verifyAdmin,adminController.Products)
//add product//
router.get("/add-product",auth.verifyAdmin,adminController.getAddProducts);


router.post("/add-products",upload.single('image'),adminController.postProducts);


//edit product//
router.get("/products/edit-product/:id",auth.verifyAdmin,adminController.getEditProducts);
router.post("/products/edit_product/:id",adminController.postEditProducts);

// router.post("/edit-products/:id",adminController.postEditProducts);
//delete product//
router.post("/products/delete_product/:id",adminController.getdeleteProducts)



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

router.post('/category/delete_categories/:id',adminController.deleteCategory);

// Edit Category Router//

router.get('/category/edit_categories/:id',auth.verifyAdmin,adminController.editCategory);

// Edit Category Router//

router.post('/category/edit_categories/:id',adminController.updateCategory);
//Order management 
router.get('/orders',adminController.Orders)


module.exports = router;
