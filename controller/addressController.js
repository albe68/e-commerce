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
var colors = require('colors');

module.exports={
    deleteAddress: async (req, res) => {
        try {
          orderHelpers
            .deleteAddress(req.session.user._id, req.params.id)
            .then((response) => {
              res.json(response);
            })
            .catch((err) => {
              res.render("user/500Page");
              console.log(err);
            });
        } catch (error) {
          res.render("user/500Page");
        }
      },
    
}