const db = require("../model/connection");
const userHelpers = require("../helpers/userHelpers");
const session = require("express-session");
const { response } = require("../app");
const mongoose = require("mongoose");
const productHelpers = require("../helpers/productHelpers");
const { body, validationResult } = require('express-validator');

module.exports = {
  
  home: (req, res) => {
    // // app.get('/:id', function (req, res) {
    //     console.log(req.params['id']);
    //     res.send();
    //   // });
    let user = req?.session?.user;
    console.log("mone", user);
    res.render("user/user", { user });
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
  shopPage: (req, res, err) => {
    try {
      let proId = req.params.id;
      let user = req?.session?.user;
      console.log("proId");
      productHelpers
        .getAllProducts()
        .then((products) => {
          console.log("WORKING");
          res.render("user/shop", { products,user });
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
      let proId = req.params.id;
      console.log("kalaaaaaaaaaaaaaa",proId)
      productHelpers
    .getProduct(proId)
    .then((products) => {
      console.log("WORKING");
      res.render("user/view-product",{products}); })}
      catch(error){

      }
    
  },
  Cart:(req,res)=>{
    res.render("user/cart")

  },
  addToCart:(req,res)=>{
    
  }
};
