const db = require("../model/connection");
const userHelpers = require("../helpers/userHelpers");
const session = require("express-session");
const { response } = require("../app");
const mongoose = require("mongoose");
const productHelpers = require("../helpers/productHelpers");
const cartHelpers=require("../helpers/cartHelpers")
const { body, validationResult } = require('express-validator');

module.exports = {
  //(newly added next and async while doing cart COUNT)
  home:async (req, res,next) => { 
    let user = req?.session?.user;
    console.log("User In", user);
    //if user load this code
    
      let cartCount= await cartHelpers?.getCartCount(user)
    
    //CHANGED THE STRUCTURE OF THIS CODE NORMAL RENDER VS PRODUCTS COMING
    productHelpers.getAllProducts().then((product)=>{
      console.log(product,"resolved products")
      
      res.render("user/user", { 
        user,
        cartCount
       });
    })
    .catch((err)=>{
      console.log(err,"ERROR")
    })
  },



  //getUserSignup
  getUserSignup: (req, res) => {
    try {
      res.render("user/signup");
      //   if(req.session){

      // }
      // else{
      //     res.render("user/signup",{nav:true});
      // }
    } catch (error) {
      console.log(error);
    }
  },
  //postUser Signup
  postUsersignup: (req, res) => {
    userHelpers
      .doSignup(req.body)
      .then((response) => {
        if (response.status) {
          console.log(req.body);
          req.session.user = response.user;
          req.session.userIn = true;
          res.redirect("/");
        } else {
          // console.log("else:",req.body)
          req.session.userIn = false;
          res.send({ value: "error" });
        }
      })
      .catch((err) => console.log(err));
  },

  //User Login
  getUsersLogin: (req, res) => {
    try {
     
      if (req.session.userIn) {
        console.log(req.session.userIn)
        res.redirect("/");
      } else {
        
        res.render("user/login",{"LoginErr":req.session.loginErr})
        req.session.loginErr=false;
      }
      
    } catch (error) {
      
      console.log(error)
    }
  },

  

  //User Login Post

  postUserSignin: (req, res) => {
    try {
      
      userHelpers
        .doLogin(req.body)
        .then((response) => {
          if (response.status) {
            // console.log(req.session);

            req.session.user = response.user;
            req.session.userIn = true;
            res.redirect("/");
          } else {
            req.session.loginErr=true;
            res.redirect("/login");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {
      res.render("user/500Page");
    }
  },
  getUserlogout: async (req, res) => {
    try {
      req.session.user =  null;
      req.session.userIn = false;
      res.clearCookie();
      res.redirect("/login");
    } catch (error) {
      res.render("user/500Page");
      console.log(error);
    }
  },
  //List Product
  shopPage: async (req, res, err) => {
    try {
      let proId = req.params.id;
      let user = req?.session?.user;
      let cartCount= await cartHelpers.getCartCount(user)
      console.log("proId");
      productHelpers
        .getAllProducts()
        .then((products) => {
          console.log("WORKING");
          res.render("user/shop", { products,user,cartCount });
        })
        .catch((err) => {
          console.log("ERROR HAPPENED");
        });
    } catch (error) {
      console.log("error");
    }
  },
  getProductPage: (req, res) => {
    try{
      //cartCOunt is lagging to get it from database
      let user=req.session.user
      let proId =  req.params.id;
      console.log(proId)//proId is sus
      
      productHelpers
    .getProduct(proId)
    .then((products) => {
      console.log(products,"PRODUCTS");
      res.render("user/view-product",{products,user}); })}
      catch(error){

      }
    
  },
  
  getAddToCart:async(req,res)=>{
    
    try{
      // req.session.returnUrl = req.originalUrl;
      // console.log(req.params.id,"===req.params.id")
      // console.log(req.session.user,"===req.session.user")
      cartHelpers.addToCart(req.params.id,req.session.user)
      .then(()=>{
        console.log("ADDED TO CART AND RIDIRECTING")
        
        res.json({status:true});
        
      })
      .catch((err)=>{
        
        console.log("catch error in .then()")
      })
    }
    catch(error){
     
      console.log("error in getADDToCart")
    }
  
},
  Cart:async (req,res)=>{
   try {
    let user=req.session.user;
    console.log("USERRRR",user);
    cartHelpers.getCartProduct(req.session.user)
    .then((cartItems)=>{
      console.log(cartItems._id,"desturcturing ITEM")
      if(1==1){
        res.render("user/cart",{
          user,cartItems
         
        });
      }
      else{
        console.log("MTTT CARTY")
      }
    })
    .catch((err)=>{
      console.log("pettuuu",err)
    })
   } catch (error) {
    console.log(error,"ERRoR")
    
   }
   

  },
  EmptyCart:(req,res)=>{
    res.render('user/emptyCart')
  },
  changeProductQuantity:async(req,res,next)=>{
    try{
      console.log("req.body",req.body)
      
     cartHelpers.changeProductQuantity(req.body, req.session.user._id).then((response)=>{
      res.json({status:true})
     })
     .catch((err)=>{
      console.log(err)

     })
    }
    catch(error){
      console.log(error)
    }

  },

  
};
