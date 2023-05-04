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
          console.log(proId, "ooo");
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
            console.log(products, "in line 30 wishlist controller");
            res.render("user/wishlist", { user, products,cartCount });
          });
        } catch (error) {
          console.log("what",error);
        }
      },
      postWishlist: (req, res) => {
        try {
          let proId = req.parms.id;
          console.log(proId);
          const addWishlist = productHelpers.addToWishlist(products);
        } catch (error) {
          console.log(error);
        }
      },
      deleteWishlist:(req,res)=>{
        console.log("wish")
        const wishId=req.body
        console.log(wishId,"wish")
        wishlistHelpers.deleteWishlist(wishId).then(()=>{
          console.log(wishId,"1111111111")
          // res.redirect('/wishlist')
        })
      },
}