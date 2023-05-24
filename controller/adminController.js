// const db=require("../model/connection")
// const { admin, category,products, user,order } = require("../model/connection");  //changed Model to model
// const session=require('express-session')
// const {response}=require("../app")
// const mongoose = require("mongoose");
// var fs = require('fs');
// var path = require('path');
// var express = require('express')
// var app = express()
// var bodyParser = require('body-parser');
// const auth=require("../controller/auth")
const productHelpers = require("../helpers/productHelpers");
const userHelpers = require("../helpers/userHelpers");
const adminHelpers = require("../helpers/adminHelpers");
const orderHelpers = require("../helpers/orderHelpers");
const couponHelpers=require("../helpers/couponHelpers")
var XLSX = require("xlsx");
const voucher_codes = require('voucher-code-generator');



//add product with multer
const multer = require("multer");
const { response } = require("express");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + file.originalname;
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});
const upload = multer({ storage: storage });
const add_image = upload.array("image", 12);

module.exports = {
  getAdminPanel: async (req, res) => {
    let variable = req.session.adminIn;

    let totalProducts,
      days = [];
    let ordersPerDay = {};
    let paymentCount = [];

    await productHelpers.getAllProducts().then((Products) => {
      totalProducts = Products.length;
    });

    let orderByCod = await orderHelpers.getCodCount();

    let codCount = orderByCod.length;

    let orderByRZPAY = await orderHelpers.razorPayCount();
    let rzPAYCount = orderByRZPAY.length;
    let totalOrder = rzPAYCount + codCount;

    let totalUser = await userHelpers.totalUserCount();

    paymentCount.push(codCount);
    paymentCount.push(rzPAYCount);

    await orderHelpers.getOrderByDate().then((response) => {
      if (response.length > 0) {
        let result = response[0]?.orders;
        for (let i = 0; i < result.length; i++) {
          let ans = {};
          ans["createdAt"] = result[i].createdAt;
          days.push(ans);
          ans = {};
        }
      }

      days.forEach((order) => {
        const day = order.createdAt.toLocaleDateString("en-US", {
          weekday: "long",
        });
        ordersPerDay[day] = (ordersPerDay[day] || 0) + 1;
      });
    });
    await orderHelpers.getAllOrders().then((response) => {
      let length = response.length;
      let total = 0;

      for (let i = 0; i < length; i++) {
        total += response[i].price;
      }
      res.render("admin/admin-dashboard", {
        layout: "adminLayout",
        variable,
        length,
        total,
        totalProducts,
        ordersPerDay,
        paymentCount,
        totalUser,
        rzPAYCount,
        codCount,
        totalOrder,
      });
    });
  },
  getAdminLogin: (req, res) => {
    try {
      if (req.session.adminIn) {
        res.redirect("/admin");
      } else {
        res.render("admin/login", { layout: "adminLayout" });
      }
    } catch (error) {
      console.log(error);
    }
  },
  postAdminlogin: (req, res) => {
    try {
      adminHelpers
        .doAdminLogin(req.body)
        .then((response) => {
          if (response.status) {
         
            req.session.admin = response.admin._id;
            req.session.adminIn = true;
            res.redirect("/admin");
          } else {
            res.redirect("/admin/login");
          }
        })
        .catch((err) => console.log("ERROR",err));
    } catch (error) {
     
      console.log(error);
    }
  },
  getAdminLogout: (req, res) => {
    try {
      req.session.admin = null;
      req.session.adminIn = false;
      res.clearCookie();
      res.redirect("/admin/login");
    } catch (error) {
      console.log(error);
    }
  },
  /*HOME PAGE*/
  indexPage: (req, res) => {
    res.render("admin/admin-dashboard", { layout: "adminLayout" });
  },
  /*PRODUCTS PAGE*/
  Products: (req, res) => {
    productHelpers.getAllProducts().then((products) => {
      res.render("admin/products", { products, layout: "adminLayout" });
    });
  },
  //ADD PRODUCTS
  getAddProducts: async (req, res) => {
    await productHelpers.getAllcategory().then((category) => {
   

      productHelpers.getAllProducts().then((products) => {
        res.render("admin/add-product", {
          layout: "adminLayout",
          products,
          category,
        });
      });
    });

  },

  postAddProduct: async (req, res) => {
  
    const { name, description, price,quantity,category } = req.body;
    const image = req.files.map((files) => files.filename);
    try {
      productHelpers.addProduct(req.body, image).then((insertedId) => {
        res.redirect("/admin/add-product");
      });
    } catch (error) {
      console.log(error);
    }
  },

  Products: (req, res) => {
    productHelpers.getAllProducts().then((products) => {
      res.render("admin/products", { products, layout: "adminLayout" });
    });
  },

  getEditProducts: async (req, res) => {
    let proId = req.params.id;
    const category = await productHelpers.getAllcategory();
    productHelpers
      .getProduct(proId)
      .then((products) => {
        res.render("admin/edit-product", {
          products,
          layout: "adminLayout",
          category,
        });
      })
      .catch((err) => console.log(err));
  },

  postEditProducts: (req, res) => {
    let proId = req.params.id;
    let body = req.body;

    const images = [];
    if (!req.files.image1) {
      let image1 = req.body.image1;
      req.files.image1 = [
        {
          fieldname: "image1",
          originalname: req.body.image1,
          encoding: "7bit",
          mimetype: "image/jpeg",
          destination: "public/uploads",
          filename: req.body.image1,
          path: ` public\\uploads\\${image1}`,
        },
      ];
    }
    if (!req.files.image2) {
      let image2 = req.body.image2;
      req.files.image2 = [
        {
          fieldname: "image2",
          originalname: req.body.image2,
          encoding: "7bit",
          mimetype: "image/jpeg",
          destination: "public/uploads",
          filename: req.body.image2,
          path: `public\\uploads\\${image2}`,
        },
      ];
    }
    if (!req.files.image3) {
      let image3 = req.body.image3;
      req.files.image3 = [
        {
          fieldname: "image3",
          originalname: req.body.image3,
          encoding: "7bit",
          mimetype: "image/jpeg",
          destination: "public/uploads",
          filename: req.body.image3,
          path: `public\\uploads\\${image3}`,
        },
      ];
    }
    if (!req.files.image4) {
      let image4 = req.body.image4;
      req.files.image4 = [
        {
          fieldname: "image4",
          originalname: req.body.image4,
          encoding: "7bit",
          mimetype: "image/jpeg",
          destination: "public/uploads",
          filename: req.body.image4,
          path: `public\\uploads\\${image4}`,
        },
      ];
    }
    if (req.files) {
      Object.keys(req?.files).forEach((key) => {
        if (Array.isArray(req?.files[key])) {
          req?.files[key]?.forEach((file) => {
            images.push(file.filename);
          });
        } else {
          images.push(req?.files[key]?.filename);
        }
      });
    }

    productHelpers
      .updateProduct(req.params.id, req.body, images)
      .then((response) => {
        res.redirect("/admin/products");
      })
      .catch((err) => {
        res.status(500).send("Internal server error");
      });
  },

  getdeleteProducts: (req, res) => {
    try {
      let proId = req.params.id;
      productHelpers
        .unlistProduct(proId)

        .then(() => {
          res.redirect("/admin/products");
        })
        .catch((err) => console.log(err));
    } catch (error) {
      console.log(error);
    }
  },
  getListProducts: (req, res) => {
    let proId = req.params.id;
    try {
      productHelpers.listProduct(proId).then(() => {
        res.redirect("/admin/products");
      });
    } catch (error) {
      console.log(error);
    }
  },
  //CATEGORY MANAGEMENT

  // Get Category

  getCategory: (req, res) => {
    try {
      productHelpers
        .getAllcategory()
        .then((category) => {
          res.render("admin/add-category", {
            layout: "adminLayout",
            category,
          });
        })
        .catch((err) => {
          res.render("user/500Page");
          console.log(err);
        });
    } catch (error) {
      res.render("user/500Page");
    }
  },

  // Add Category

  addCategory: (req, res) => {
    try {
      productHelpers
        .addCategory(req.body)
        .then((response) => {
          if (response == false) {
            res.send({ value: "error" });

            res.redirect("/admin/category");
          } else {
            res.send({ value: "good" });
            res.redirect("/admin/category");
          }
        })
        .catch((err) => {
          console.log("ERROR",err);
        });
    } catch (error) {
      console.log(error);
    }
  },

  deleteCategory: (req, res) => {
    try {
      let cateId = req.params.id;
      productHelpers
        .deleteCategory(cateId)
        .then(() => {

          res.redirect("/admin/category");
        })
        .catch((err) => console.log("ERROR",err));
    } catch (error) {
      console.log(error);
    }
  },
  ud: (req, res) => {
  },
  // Edit Category

  editCategory: (req, res) => {
    try {
      var catId = req.params.id;
      productHelpers
        .getCategory(catId)
        .then((category) => {
          res.render("admin/edit-category", {
            layout: "adminLayout",
            category,
          });
        })
        .catch((err) => {
          res.render("user/500Page");
          console.log(err);
        });
    } catch (error) {
      res.render("user/500Page");
    }
  },

  // Update Category

  updateCategory: (req, res) => {
    let cate = req.body;
    let cateId = req.params.id;
    productHelpers
      .updateCategory(cate, cateId)
      .then(() => {
        res.redirect("/admin/category");
      })
      .catch((err) => console.log(err));
  },

  Users: (req, res) => {
    productHelpers.getAllUsers().then((user) => {
     
      res.render("admin/users", { user, layout: "adminLayout" });
    });
  },

  blockUser: (req, res) => {
    let userId = req.params.id;

    userHelpers
      .blockUser(userId)
      .then(() => {
        res.redirect("/admin/users");
      })
      .catch((err) => console.log(err));
  },

  // Unblock Users

  unblockUser: (req, res) => {
    let userId = req.params.id;
    userHelpers
      .unblockUser(userId)
      .then(() => {
        res.redirect("/admin/users");
      })
      .catch((err) => console.log(err));
  },
  getAdminOrders: (req, res) => {
    try {
      orderHelpers.getAdminOrders().then((data) => {

        res.render("admin/orders", { layout: "adminLayout", data });
      });
    } catch (error) {
      console.log(error);
    }
  },
  updateOrder: (req, res) => {
    try {
      orderHelpers
        .updateOrder(req.body)
        .then((response) => {
          res.json(response);
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {
      console.log(error);
    }
  },
  getSalesReport: async (req, res) => {
    try {
      getDate = (date) => {
        let orderDate = new Date(date);
        let day = orderDate.getDate();
        let month = orderDate.getMonth() + 1;
        let year = orderDate.getFullYear();
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();
        return `${isNaN(day) ? "00" : day}-${isNaN(month) ? "00" : month}-${
          isNaN(year) ? "0000" : year
        } ${date.getHours(hours)}:${date.getMinutes(minutes)}:${date.getSeconds(
          seconds
        )}`;
      };

      const total = await adminHelpers.getSalesRepTotalAmount();
      const report = await adminHelpers.salesReport();
      let Details = [];
      report.forEach((orders) => {
        Details.push(orders.orders);
      });
      
      res.render("admin/salesReport", {
        layout: "adminLayout",
        Details,
        getDate,
        total,
      });
    } catch (error) {
      console.log(error);
    }
  },
  postSalesReport: async (req, res) => {
    try {
      getDate = (date) => {
        let orderDate = new Date(date);
        let day = orderDate.getDate();
        let month = orderDate.getMonth() + 1;
        let year = orderDate.getFullYear();
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();
        return `${isNaN(day) ? "00" : day}-${isNaN(month) ? "00" : month}-${
          isNaN(year) ? "0000" : year
        } ${date.getHours(hours)}:${date.getMinutes(minutes)}:${date.getSeconds(
          seconds
        )}`;
      };
      let Details = [];
      let total = await adminHelpers.getTotalAmount(req.body);
      adminHelpers.postReport(req.body).then((orderData) => {
        orderData.forEach((orders) => {
          Details.push(orders.orders);
        });
        res.render("admin/salesReport", {
          layout: "adminLayout",
          Details,
          getDate,
          total,
        });
      });
    } catch (error) {
      console.log(error,"error tested");
    } 
  },
  postAddCoupon:(req,res)=>{
   
    const coupon=req.body;
    let data={
      coupon: req.body.coupen,
      discountType: req.body.discountType,
      cappedAmount: req.body.cappedAmount,
      amount: req.body.discountAmount,
      amountValidity: req.body.amountValidity,
      percentage: req.body.discountPercentage,
      validity: req.body.validity,
      description: req.body.description,
      redeemTime: req.body.redeemTime,
    
    }
    couponHelpers.addNewCoupon(data).then(response=>{
      res.json(response)
    })

  },
  getCoupon:async(req,res)=>{
    
    let coupon=await couponHelpers.getAllCoupon().then(response=>{
     
      res.render("admin/coupon-management",{layout:"adminLayout",response})

    })
  }, 
  generateCoupon:async(req,res)=>{
    try {
      
      const couponCode=    voucher_codes.generate({
        length: 3,
        count: 5,
        prefix: "GS-",
        charset: "0123456789"
        
    });
    console.log("good")
   
    res.send({ coupenCode: couponCode })
    } catch (error) {
     
      console.log(error);
      res.render("user/500Page");
    }
 
  },
  getAddCoupon:(req,res)=>{
    res.render("admin/add-coupon",{layout: "adminLayout"})
  }


};
