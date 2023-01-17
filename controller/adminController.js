const db=require("../model/connection")
const productHelpers = require("../helpers/productHelpers")
const userHelpers=require("../helpers/userHelpers")
// const fileupload=require("express-fileupload")
const { admin, category,products } = require("../Model/connection");
const session=require('express-session')
const {response}=require("../app")
const mongoose = require("mongoose");
var fs = require('fs');
var path = require('path');
var express = require('express')
var app = express()
var bodyParser = require('body-parser');
const auth=require("../controller/auth")
const adminHelpers = require("../helpers/adminHelpers");

const multer  = require('multer')


// let adminData={
//     username:"admin@gmail.com",
//     password:"admin",
//     name:"Albert"
// }
module.exports={
  getAdminPanel:(req,res)=>{
    try{
      if(req.session.adminIn){
        console.log(req.session.adminIn)
        res.render("admin/admin-dashboard",{
          layout:"adminLayout"
        })
      }
      else{
        res.redirect("/admin/login")
      }

    }
    catch(error){
      console.log(error)

    }
  }
  ,
    getAdminLogin:(req,res)=>{
         try
        { if(req.session.adminIn)
          {
            console.log(req.session.adminIn)
     res.render("admin/admin-dashboard",{layout:"adminLayout"})          }
          else{
            res.render("admin/login",{layout:"adminLayout"}) 
          }
        }
         catch(error){
          console.log(error);

         }

    },
    postAdminlogin:(req,res)=>{
        // console.log("hello",adminData)
      try{ 
        adminHelpers.doAdminLogin(req.body)
        .then((response)=>{
          if(response.status){
            console.log(response.status)
            console.log(response.admin._id)
            req.session.admin=response.admin._id;
            req.session.adminIn=true;
            console.log(req.session.adminIn)
            res.redirect("/admin")
          }
          else{
            res.redirect("/admin/login")
          }
        })
          .catch((err)=>console.log("QWERTYUIYTREW"))
        }
        catch(error){
          console.log("ERROORRORRR")
          console.log(error)
        }
    },
    getAdminLogout:(req,res)=>{
      try{
        req.session.admin=null;
        req.session.adminIn=false;
        res.clearCookie();
        console.log("LOGGED OUT")
        res.redirect("/admin/login");
        console.log(req.session.adminIn)
      }
      catch(error){
        console.log(error)
      }
      
    },
    /*HOME PAGE*/
    indexPage:(req,res)=>{
      res.render("admin/admin-dashboard",{layout:"adminLayout"})
    },
  /*PRODUCTS PAGE*/
  Products:(req,res)=>{
    productHelpers.getAllProducts().then((products)=>{
    // console.log("these are :",products)
    res.render("admin/products", {products,layout: "adminLayout"})
    })
 
  },
//ADD PRODUCTS
getAddProducts: (req, res) => {
      
        productHelpers
          // .getAllProducts()
          // .then((products) => {
            res.render("admin/add-product", {
              layout: "adminLayout",products})
              
            // });
          // })
      },
      postProducts:(req,res)=>{
        console.log(req.body);
        
       
        productHelpers.postAddProduct(req.body, req.file.filename).then((response)=>{
          res.redirect('/admin/add-product')
      })
    },
  postAddProduct: (req, res) => {
  productHelpers.addProduct(req.body).then((insertedId) => {
      //  console.log(req.body)
        var obj={
          image: {
           data: fs.readFileSync(path.join('public/uploads/'+ req.file.filename)),
            contentType: 'image/png'
            }
        }
        products.create(obj, (err, products) => {
          if (err) {
            
          console.log(err);
          }
          else {
          products.save();
          console.log("IMAGE ADDED")
          
          res.redirect('/admin/add-product');
          }
          });
        
        
      })
      .catch((err) => console.log(err));
  },

  Products:(req,res)=>{
    productHelpers.getAllProducts().then((products)=>{
    // console.log("these are :",products)
    res.render("admin/products", {products,layout: "adminLayout"})
    })
 
  },
  // editProduct: (req, res) => {
  //   let proId = req.params.id;
  //   productHelpers
  //     .getProduct(proId)
  //     .then((product) => {
  //       res.render("admin/edit-product", {
  //         layout: "admin-layout",
  //         product,
  //       });
  //     })
  //     .catch((err) => console.log(err));
  // },
  getEditProducts:(req,res)=>{
   let proId = req.params.id;
   console.log("get:",proId)
  productHelpers.getProduct(proId).then((products) => {
        res.render("admin/edit-product", {
          products,
          layout: "adminLayout",
         });
      })
      .catch((err) =>
         console.log(err));
      

      
  },
  
  postEditProducts: (req, res) => {
    let proId = req.params.id;
    let body = req.body;
    // console.log("BODYYYYYYYYYYYY",body)
    productHelpers
      .updateProduct(proId,body)
      .then(() => {
        console.log("gifiidiiddd",body)
        res.redirect("/admin/products");
     
        
      })
      .catch((err) => console.log(err));
  },
  

  
  
  getdeleteProducts:(req,res)=>{
    try{console.log("THIS ISparams",req.params.id)
    let proId=req.params.id;
    productHelpers.deleteProduct(proId)
    
    .then(() => {
      console.log("hiiiii")
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));}
    catch(error){
      console.log(error)

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
        .addCategory(req.body).then((response) => {
          
          if (response == false) {
            console.log("ALREADY EXSISTS")
            res.redirect("/admin/category")
          } 
          else {
            console.log("responseeeeeeeeeeeeeeeeeeeeeee",response)
            res.redirect("/admin/category")
          }
        })
        .catch((err) => {
          console.log("ERROR")
        });
    } 
    catch (error) {
      console.log(error)
    }
  },

  deleteCategory: (req, res) => {
    console.log("HEYY")
    let cateId = req.params.id;
    console.log("Moneeeeeeeeeeeeeeee")
    productHelpers.deleteCategory(cateId)
      .then(() => {
        console.log("hiiiii")

        res.redirect("/admin/category");
      })
      .catch((err) => console.log("ERROR"));
  },
  
  
  // Edit Category

  editCategory: (req, res) => {
    try {
      
      var catId =req.params.id;
      productHelpers
        .getCategory(catId)
        .then((category) => {
          res.render("admin/edit-category", {
            layout: "adminLayout",category
            
          });
        })
        .catch((err) => {
          res.render("user/500Page");
          console.log(err);
        });
    } 
    catch (error) {
      res.render("user/500Page");
    }

    
  },

     // Update Category

  updateCategory: (req, res) => {
    let cate = req.body;
    let cateId = req.params.id;
    console.log("HELOOOOOOOOOOOOOOOO",cate,cateId)
    productHelpers
      .updateCategory(cate, cateId)
      .then(() => {
        res.redirect("/admin/category");
      })
      .catch((err) => console.log(err));
  },
  




  Users:(req,res)=>{
    
    productHelpers.getAllUsers().then((user)=>{
      console.log(user)
      res.render('admin/users',{user,layout:"adminLayout"})
    })
    
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
    } 
    
    

