const db = require("../model/connection");
const cartHelpers = require("../helpers/cartHelpers");
const orderHelpers = require("../helpers/orderHelpers");
const couponHelpers=require("../helpers/couponHelpers")
const { body, validationResult } = require("express-validator");
const slugify = require("slugify");
const colors = require('colors');
const voucher_codes = require('voucher-code-generator');
const session = require("express-session");

let couponPrice = 0;



module.exports={
    getOrder: async (req, res) => {
        let user = req.session.user._id;
    
        let cartCount = await cartHelpers?.getCartCount(user);
    
        let cartItems = await cartHelpers.getCartProduct(req.session.user);
        let address = await db.address.find({ user: req.session.user._id });
        console.log(address,"SET")
    
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
    
          let total = await cartHelpers.getTotal(req.session.user._id);
          total = total - couponPrice;
          let totalPrice = total;
          let total1 = total;
          let products = await cartHelpers.getCartProductList(req.session.user._id);
          console.log(
            
            req.body.userId,
            req.session.user._id,
            
          );
          orderHelpers
            .placeOrder(req.body, total, products, req.session.user._id)
            .then((response) => {
              couponPrice=0;
              if (req.body.paymentMethod == "COD") {
                
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
      verifypayment: (req, res) => {
        try {
          res.json({ status: true });
        } catch {}
      },
      verifyCoupon:async(req,res)=>{
        try{
          console.log(req.query.couponName);
          let code=req.query.couponName;
          let total=await cartHelpers.getTotal(req.session._id);
          couponHelpers.couponValidator(code,req.session._id,total).then(response=>{
            res.json(response);
          });
   
        console.log(colors.green('vouceherrrr: %s'), hi);
      }
        catch{

        }
      }
}