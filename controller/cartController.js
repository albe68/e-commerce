const db = require("../model/connection");
const cartHelpers = require("../helpers/cartHelpers");
const { body, validationResult } = require("express-validator");
const slugify = require("slugify");
var colors = require("colors");


module.exports = {
  
  getAddToCart: async (req, res) => {
    try {
      // req.session.returnUrl = req.originalUrl;
      //
      //
      cartHelpers
        .addToCart(req.params.id, req.session.user)
        .then(() => {

          res.json({ status: true });
        })
        .catch((err) => {
          console.log("err",err);
        });
    } catch (error) {
      console.log("error in getADDToCart",err);
    }
  },
  Cart: async (req, res) => {
    try {
      let user = req.session.user;
      let cartCount = await cartHelpers.getCartCount(user);
     
      var hi = { user, cartCount };
     
      if (cartCount > 0) {
        //if condition for if cart is empty total Price is also empty so error occurs

        let totalPrice = await cartHelpers.getTotal(req.session.user._id);
        if (user) {
          cartHelpers
            .getCartProduct(req.session.user)
            .then((cartItems) => {
             
              if (cartCount && user) {
                res.render("user/cart", {
                  user,
                  cartItems,
                  cartCount,
                  totalPrice,
                });
              } else {
                res.render("user/emptyCart", { cartCount, user });
              }
            })
            .catch((err) => {
              console.log("Error in Cart .catch()", err);
            });
        }

        //this else condition might give future error
        else {
          //Redirecting to login if guest opens cart without login
          res.redirect("/login");
        }
      } else {
        res.render("user/emptyCart", { cartCount, user });
      }
     
    } catch (error) {
      console.log(error, "ERRoR");
    }
  },
  EmptyCart: (req, res) => {
    try {
      res.render("user/emptyCart");
    } finally {
      console.log("TRIED FINALLY HERE"); //finally
    }
  },
  changeProductQuantity: async (req, res, next) => {
    try {
     
      let userId = req.session.user._id;
      cartHelpers
        .changeProductQuantity(req.body, userId)
        .then((response) => {
          res.json({ status: true });
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {
      console.log(error);
    }
  },
  removeCart: async (req, res) => {
    try {
     
     
      cartHelpers
        .deleteCartProduct(req.body, req.session.user._id)
        .then((response) => {
          res.json(response);
        })
        .catch((err) => {
          console.log("ERROR IN REMOVE CART",err);
        });
    } catch (error) {
      console.log("error is remove cart catch",error);
    }
  },
  checkCartQuantity: (req, res) => {
    try {
     
      cartHelpers
        .checkCartQuantity(req.session.user._id, req.params.id)
        .then((response) => {
          res.json(response);
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {
      console.log(error, "ERROR PAGE ");
    }
  },
  changeProductQuantity: async (req, res, next) => {
    try {
     
      let userId = req.session.user._id;
      cartHelpers
        .changeProductQuantity(req.body, userId)
        .then((response) => {
          res.json({ status: true });
        })
        .catch((err) => {
          console.log(err;
        });
    } catch (error) {
      console.log(error);
    }
  }
};
