const db = require("../model/connection");
const productHelpers = require("../helpers/productHelpers");
const wishlistHelpers = require("../helpers/wishlistHelpers");
const cartHelpers = require("../helpers/cartHelpers");
const { body, validationResult } = require("express-validator");
const slugify = require("slugify");
var colors = require('colors');
const { accessSync } = require("fs");


module.exports={
    addToWishlist: async(req, res) => {
        try {
          let wishlist=await wishlistHelpers
          let proId = req.params.id;
          let user = req.session.user._id;
         
          wishlistHelpers.addToWishlist(proId, user)
            .then((response) => {
              res.redirect("/shop")
            })
            .catch((err) => {
              console.log(err);
            });
        } catch (error) {
          console.log(error);
        }
      },
      getWishlist:async (req, res) => {
        try {
          let user = req.session.user._id;
          let cartCount = await cartHelpers.getCartCount(user);

          wishlistHelpers.listWishlist(user).then((products) => {
           
            res.render("user/wishlist", { user, products,cartCount });
          });
        } catch (error) {
          console.log("what",error);
        }
      },
      postWishlist: (req, res) => {
        try {
          let proId = req.parms.id;
         
          const addWishlist = productHelpers.addToWishlist(products);
        } catch (error) {
          console.log(error);
        }
      },
      deleteWishlist:(req,res)=>{
       
        const wishId=req.body
       
        wishlistHelpers.deleteWishlist(wishId).then(()=>{
         
          // res.redirect('/wishlist')
        })
      },
}