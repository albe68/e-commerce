const db = require("../model/connection");
const productHelpers = require("../helpers/productHelpers");
const wishlistHelpers = require("../helpers/wishlistHelpers");
const { body, validationResult } = require("express-validator");
const slugify = require("slugify");
var colors = require('colors');


module.exports={
    addToWishlist: (req, res) => {
        try {
          let proId = req.params.id;
          let user = req.session.user._id;
          console.log(proId, "ooo");
          wishlistHelpers
            .addToWishlist(proId, user)
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
      getWishlist: (req, res) => {
        try {
          let user = req.session.user._id;
          wishlistHelpers.listWishlist(user).then((products) => {
            console.log(products, "lol");
            res.render("user/wishlist", { user, products });
          });
        } catch (error) {
          console.log(error);
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