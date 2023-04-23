const db = require("../model/connection");
const cartHelpers = require("../helpers/cartHelpers");
const orderHelpers = require("../helpers/orderHelpers");
const { body, validationResult } = require("express-validator");
const slugify = require("slugify");
var colors = require('colors');


module.exports={
    getOrder: async (req, res) => {
        let user = req.session.user._id;
    
        let cartCount = await cartHelpers?.getCartCount(user);
    
        let cartItems = await cartHelpers.getCartProduct(req.session.user);
        let address = await db.address.find({ user: req.session.user._id });
        // console.log(address)
        console.log(cartItems.quantity);
    
        let totalPrice = await cartHelpers.getTotal(req.session.user._id);
        console.log("KIKIKIKIKIKI", req.body, "KIKIKIKIKI");
        res.render("user/order", {
          user: req.session.user,
          totalPrice,
          cartItems,
          address,
          cartCount
        });
      },
      placeOrder: async (req, res) => {
        try {
          console.log(req.body);
          req.body.userId = await req.session.user._id;
    
          let totalPrice = await cartHelpers.getTotal(req.session.user._id);
    
          let products = await cartHelpers.getCartProductList(req.session.user._id);
          console.log(
            "1111111111111111",
            req.body.userId,
            req.session.user._id,
            "222222222222"
          );
          orderHelpers
            .placeOrder(req.body, totalPrice, products, req.session.user._id)
            .then((response) => {
              if (req.body.paymentMethod == "COD") {
                console.log("123456785trewfgbxsdbxdfdfsfdsfdsfsdfdfsdfdfsdaf");
                res.json({ statusCod: true });
              } else if (req.body.paymentMethod == "razorpay") {
                orderHelpers
                  .generateRazorPay(req.session.user._id, totalPrice)
                  .then((response) => {
                    console.log(response, "uk");
                    res.json(response);
                  });
              }
            })
            .catch((err) => {
              console.log(err, "ERROR");
            });
        } catch (error) {
          console.log("ERROR");
        }
      },
      orderSucesss: async (req, res) => {
        let user = req.session.user._id;
    
        let cartCount = await cartHelpers?.getCartCount(user);
    
        // let orders = await orderHelpers.getOrders(req.session.user._id);
        let orders = await orderHelpers.getOrders(user); // when db.collection name is called without await the whole schema comes so use await db.orders.find({})
        console.log("123456", orders);
        res.render("user/order-success", { user, orders,cartCount});
      },
      cancelOrder: async (req, res) => {
        console.log("AHHAHAHAHAHHAHAHAHA", req.body);
        let user = req.session.user._id; // doubht in user
        try {
          orderHelpers
            .cancelOrder(req.body, req.session.user)
            .then((response) => {
              console.log(response);
              res.json(response);
            })
            .catch((err) => {
              console.log(err);
            });
        } catch (error) {
          console.log(error);
        }
      },
}