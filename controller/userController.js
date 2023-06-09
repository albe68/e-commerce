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
const otp = require("../middleware/otp/otp");
const couponHelpers = require("../helpers/couponHelpers");
const client = require("twilio")(otp.accountSid, otp.authToken);
let couponPrice = 0;

let otpNumber;
module.exports = {
  //(newly added next and async while doing cart COUNT)
  darkMode: (req, res) => {
    try {
      var x = "foo";
    } catch (error) {
      console.error("An error occurred: ", error);
    }
  },
  home: async (req, res, next) => {
    try {

      let user = req?.session?.user;
     

      let cartCount = await cartHelpers?.getCartCount(user);
      let category = await productHelpers.getAllcategory();
      productHelpers
        .getAllProducts()
        .then((product) => {

          res.render("user/user", {
            user,
            cartCount,
            category,
          });
        })
        .catch((err) => {
          console.log(err, "ERROR");
        });
    } catch (error) {
      console.log(error);
    }
  },
  //getUserSignup
  getUserSignup: (req, res) => {
    try {
      //USER CANNOT SIGNUP IF HE IS LOGGED IN
      if (req.session.user) {
        res.redirect("/");
      } else {
        res.render("user/signup");
      }
    } catch (error) {
      console.log(error);
    }
  },
  //postUser Signup
  postUsersignup: (req, res) => {
    try {
      userHelpers
        .doSignup(req.body)
        .then((response) => {
          if (response.status) {
            ;
            req.session.user = response.user;
            req.session.userIn = true;
            res.redirect("/");
          } else {
            req.session.userIn = false;
            res.send({ value: "error" });
          }
        })
        .catch((err) => console.log(err));
    } catch (error) {
      console.log(error);
    }
  },

  //User Login
  getUsersLogin: (req, res) => {
    try {
      if (req.session.userIn) {
        res.redirect("/");
      } else {
        res.render("user/login", { LoginErr: req.session.loginErr });
        req.session.loginErr = false;
      }
    } catch (error) {
      console.log(error);
    }
  },

  //User Login Post

  postUserSignin: (req, res) => {
    try {
    
      userHelpers
        .doLogin(req.body)
        .then((response) => {
          if (response.status) {

            req.session.user = response.user;
            req.session.userIn = true;
            res.redirect("/");
          } else {
            req.session.loginErr = true;
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
      req.session.user = null;
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
      let pageIndex = req.query.page;
      let currentPage = pageIndex;
      let perPage = 6;
      let documentCount = await userHelpers.documentCount();
      let pages = Math.ceil(parseInt(documentCount) / perPage);
      let user = req?.session?.user;
      let cartCount = await cartHelpers.getCartCount(user);
      let category = await productHelpers.getAllcategory();

      productHelpers
        .shopListProducts(pageIndex)
        .then((response) => {
          res.render("user/shop", {
            response,
            user,
            category,
            cartCount,
            pages,
          });
        })
        .catch((err) => {
          console.log("ERROR HAPPENED",err);
        });
    } catch (error) {
      console.log(error);
    }
  },
  getProductPage: async (req, res) => {
    try {
      //cartCOunt is lagging to get it from database
      let user = req.session.user;
      let proId = req.params.id;
      let cartCount = await cartHelpers.getCartCount(user);


      productHelpers.getProduct(proId).then((products) => {
        res.render("user/view-product", { products, user, cartCount });
      });
    } catch (error) {
      console.log(error);
    }
  },

  //CART

  getAddToCart: async (req, res) => {
    try {
      // req.session.returnUrl = req.originalUrl;
     
      
      cartHelpers.addToCart(req.params.id,req.session.user)
        .then(() => {

          res.json({ status: true });
        })
        .catch((err) => {
          console.log(err);
        });
    } 
    catch (error) {
      console.log(error);
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
      console.log("error is remove cart catch");
    }
  },

  //ORDER
  getOrder: async (req, res) => {
    let user = req.session.user._id;

    let cartCount = await cartHelpers?.getCartCount(user);

    let cartItems = await cartHelpers.getCartProduct(req.session.user);
    let address = await db.address.find({ user: req.session.user._id });

    let totalPrice = await cartHelpers.getTotal(req.session.user._id);
    res.render("user/order", {
      user: req.session.user,
      totalPrice,
      cartItems,
      address,
      cartCount,
    });
  },
  placeOrder: async (req, res) => {
    try {
      ;
      req.body.userId = await req.session.user._id;
     let totalPrice = await cartHelpers.getTotal(req.session.user._id);
     let coupon= req.body.couponName;
      couponPrice=await cartHelpers.applyCoupoun(coupon,req.session.user._id,totalPrice)
      // totalPrice = couponPrice.finalAmount- totalPrice;
      let products = await cartHelpers.getCartProductList(req.session.user._id);
     
      orderHelpers.placeOrder(req.body,couponPrice, req.session.user._id).then( (response)=> {

          if (req.body.paymentMethod == "COD") {
            res.json({ statusCod: true });
          } 
          else if (req.body.paymentMethod == "razorpay") {
            orderHelpers
              .generateRazorPay(req.session.user._id, totalPrice)
              .then((response) => {
                res.json(response);
              });
          }
        })
        .catch((err) => {
          console.log(err, "ERROR in 367" );
        });
    } catch (error) {
      console.log("ERROR in 370",error);
    }
  },
  orderSucesss: async (req, res) => {
    let user = req.session.user._id;

    let cartCount = await cartHelpers?.getCartCount(user);

    // let orders = await orderHelpers.getOrders(req.session.user._id);
    let orders = await orderHelpers.getOrders(user); // when db.collection name is called without await the whole schema comes so use await db.orders.find({})
    res.render("user/order-success", { user, orders, cartCount });
  },
  cancelOrder: async (req, res) => {
    let user = req.session.user._id; // doubht in user
    try {
      orderHelpers
        .cancelOrder(req.body, req.session.user)
        .then((response) => {
          res.json(response);
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {
      console.log(error);
    }
  },

  filterProduct: async (req, res) => {
    let catName = req.params.id;
    let user = req?.session?.user;

    let cartCount = await cartHelpers?.getCartCount(user);
    let category = await productHelpers.getAllProducts();
    productHelpers.filterCategory(catName).then((filterproducts) => {
      res.render("user/filter", { user, filterproducts, cartCount, category });
    });
  },

  getprofilePage: async (req, res) => {
    let user = req?.session?.user;
    let cartCount = await cartHelpers?.getCartCount(user);

    let address = await db.address.find({ user: req.session.user._id });

    // res.render("user/profile", { user, address });

    try {
      // var user1= await orderHelpers.getUserOrders()
      orderHelpers.getAdminOrders().then((data) => {

        res.render("user/profile", { data, user, address, cartCount });
      });
    } catch (error) {
      console.log("errrorr", error);
    }
  },
  changePassword: async (req, res) => {
    try {
      await userHelpers.changePassword(profileId, req.body).then((data) => {
        res.redirect("/");
      });
    } catch (error) {
      console.log(error);
    }
  },
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

  verifypayment: (req, res) => {
    try {
      res.json({ status: true });
    } catch {}
  },
  addToWishlist: (req, res) => {
    try {
      let proId = req.params.id;
      let user = req.session.user._id;
      wishlistHelpers
        .addToWishlist(proId, user)
        .then((response) => {
          res.redirect("/shop");
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
        res.render("user/wishlist", { user, products });
      });
    } catch (error) {
      console.log(error);
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
  deleteWishlist: (req, res) => {
    const wishId = req.body;
    wishlistHelpers.deleteWishlist(wishId).then(() => {
      // res.redirect('/wishlist')
    });
  },
  changePassword: async (req, res) => {
    let userId = req.session.user._id;
    const passwords = req.body;
    await userHelpers.changePassword(passwords, userId);
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

  getSearch: async (req, res) => {
    let user = req?.session?.user;

    let cartCount = await cartHelpers?.getCartCount(user);

    let category = await productHelpers.getAllcategory();

    const isUser = req.session.user;
    let viewCategory = await categoryHelpers.viewAddCategory();
    userHelpers
      .productSearch(req.body)
      .then((response) => {
        if (response) {
          res.render("user/shop-search", {
            viewCategory,
            response,
            user,
            category,
            cartCount,
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  },
  sortProducts: async (req, res) => {
    let user = req?.session?.user;

    let cartCount = await cartHelpers?.getCartCount(user);

    let category = await productHelpers.getAllcategory();

    let sortOption = req.body["selectedValue"];
    let viewCategory = await categoryHelpers.viewAddCategory();
    userHelpers.postSort(sortOption).then((response) => {
      if (response) {
        res.render("user/shop-search", {
          response,
          viewCategory,
          user,
          category,
          cartCount,
        });
      }
    });
  },

  getUserOtpLogin: (req, res) => {
    // let userIn=req.session.userLoggedIn
    // let user=req.session.user._id

    res.render("user/otpLogin");
  },
  postUserOtpLogin: async (req, res) => {
    try {
      number = req.body.number;
      let users = await db.user.find({ phoneNumber: number }).exec();
      console.log(colors.green("userIn: %s"), number, req.body, users);

      loggedUser = users;
      if (users == false) {
        res.redirect("/login");
      } else {
        console.log(colors.green("else case worked%s"), number, req.body);
        client.verify.v2
          .services(otp.verifySid)
          .verifications.create({ to: `+91 ${number}`, channel: "sms" })
          .then((verification) => console.log(verification.status))
          .then(() => {
            const readline = require("readline").createInterface({
              input: process.stdin,
              output: process.stdout,
            });
            res.render("user/otpEntering");
          });
      }
    } catch (err) {
      console.log(err);
    }
  },
  postOtpVerify: async (req, res) => {
    try {
      let user = req?.session?.user;

      let cartCount = await cartHelpers?.getCartCount(user);
      let category = await productHelpers.getAllcategory();
      otpNumber = req.body.otp;
      await client.verify?.v2
        .services(otp.verifySid)
        .verificationChecks.create({ to: `+91 ${number}`, code: otpNumber })
        .then((verification_check) => {

          if (verification_check.valid == true) {
            let id = loggedUser[0]._id;
            req.session.user = { loggedUser, id };
            req.session.userLoggedIn = true;
            userSession = req.session.userLoggedIn;
            res.render("user/user", {
              userSession,
              user,
              category,
              cartCount,
              countdown: 60,
            });
          } else {
            res.redirect("/otp-verify");
          }
        });
    } catch (error) {
      console.log(error);
    }
  },
  getOtpVerify: (req, res) => {
    res.render("user/otp-entering");
  },

  postUserLogin: async (req, res) => {
    try {
      await userHelpers.doLogin(req.body).then((response) => {
        let loggedInStatus = response.loggedInStatus;
        let blockedStatus = response.blockedStatus;
        if (loggedInStatus == true) {
          req.session.user = response;
          req.session.userLoggedIn = true;
          userSession = req.session.userLoggedIn;
          res.redirect("/");
        } else {
          blockedStatus;
          res.render("user/login", { loggedInStatus, blockedStatus });
        }
      });
    } catch (error) {
      res.status(500);
    }
  },

  orderDetails: async (req, res) => {
    try {
      let userId=req.session.user._id
      let orderId= req.params;
      const products=await orderHelpers.orderDetails(orderId,userId)
      res.json({ status: true });
    } catch (error) {
      console.log(error);
    }
  },
  viewOrder:async(req,res)=>{
    let userId=req.session.user._id
    let orderId= req.params;
    const products=await orderHelpers.orderDetails(orderId,userId)
    res.render("user/order-details",{products});
  },
  verifyCoupon:(req,res)=>{
    try{
      couponHelpers.verifyCoupon(req.body,req.session.user._id)
      .then(response=>{
        res.json(response);
      }).catch(err=>{
        console.log(err);
      })
    }
    catch(err){
      console.log(err)
    }
  },
  couponChecked:async(req,res)=>{
    try {
      let coupenCheck = req.body.couponCheck;
      couponHelpers
        .couponChecked(coupenCheck, req.session.user._id)
        .then((response) => {
          res.json(response);
        })
        .catch((err) => {
          console.log(err);

          res.render("user/500Page");
        }); 
    } catch (error) {
      console.log(error);
    }
  },
  
  applyCoupon:async(req,res)=>{
  try {   
    
    let coupon=req.body.coupon_Name;
    let total=await cartHelpers.getTotal(req.session.user._id)
    
     
      let couponData=await cartHelpers.applyCoupoun(coupon,req.session.user._id,total).then((response)=>{
        couponPrice = response.discountAmount;

        res.json(response);

      });



    }
      catch(err){
        console.log(err)

      }
  }
};
