const db = require("../model/connection");
// const session = require("express-session");
// const { response } = require("../app");
// const mongoose = require("mongoose");
const userHelpers = require("../helpers/userHelpers");
const productHelpers = require("../helpers/productHelpers");
const cartHelpers = require("../helpers/cartHelpers");
const orderHelpers = require("../helpers/orderHelpers");
const categoryHelpers = require("../helpers/categoryHelpers");
const wishlistHelpers = require("../helpers/wishlistHelpers");
const { body, validationResult } = require("express-validator");
// const { orders } = require("../controller/userController");
const slugify = require("slugify");
var colors = require("colors");
module.exports = {
  filterProduct: async (req, res) => {
    let catName = req.params.id;
    let user = req?.session?.user;
   

    let cartCount = await cartHelpers?.getCartCount(user);
    let category = await productHelpers.getAllProducts();
   
    productHelpers.filterCategory(catName).then((filterproducts) => {
     
      res.render("user/filter", { user, filterproducts, cartCount, category });
    });
  },
};
