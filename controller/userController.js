const db = require("../model/connection");
const userHelpers = require("../helpers/userHelpers");
const session = require("express-session");
const { response } = require("../app");
const mongoose = require("mongoose");
const productHelpers = require("../helpers/productHelpers");
const cartHelpers = require("../helpers/cartHelpers");
const { body, validationResult } = require("express-validator");
const orderHelpers = require("../helpers/orderHelpers");
const { orders } = require("../controller/userController");
const categoryHelpers = require("../helpers/categoryHelpers");
const slugify = require("slugify");
const wishlistHelpers = require("../helpers/wishlistHelpers");
module.exports = {
  //(newly added next and async while doing cart COUNT)
  home: async (req, res, next) => {
    try {
      var hello = slugify("JHSAj khjHSJABSnkhs bnSNKHAJK SNBANBSNSHBakjn");
      console.log(hello);
      let user = req?.session?.user;
      console.log("User In", user);
      //if user load this code

      let cartCount = await cartHelpers?.getCartCount(user);
      let category = await productHelpers.getAllcategory();
      console.log("shjahsjahsjahskjash");
      //CHANGED THE STRUCTURE OF THIS CODE NORMAL RENDER VS PRODUCTS COMING
      productHelpers
        .getAllProducts()
        .then((product) => {
          console.log(product, "resolved products");

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
    } catch (error) {
      console.log(error);
    }
  },

  //User Login
  getUsersLogin: (req, res) => {
    try {
      if (req.session.userIn) {
        console.log(req.session.userIn);
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
            // console.log(req.session);

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
      console.log(req.query.page, "find");
      let proId = req.params.id;
      let pageIndex = req.query.page;
      let currentPage = pageIndex;
      let perPage = 6;
      let documentCount = await userHelpers.documentCount();
      console.log(documentCount, ":: ");
      let pages = Math.ceil(parseInt(documentCount) / perPage);
      console.log(pages, "uuu");
      let user = req?.session?.user;
      let cartCount = await cartHelpers.getCartCount(user);
      let category = await productHelpers.getAllcategory();
      console.log("response", response);
      console.log("proId");
      productHelpers
        .shopListProducts(pageIndex)
        .then((response) => {
          console.log("WORKING");
          res.render("user/shop", {
            response,
            user,
            category,
            cartCount,
            pages,
          });
        })
        .catch((err) => {
          console.log("ERROR HAPPENED");
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

      console.log(proId); //proId is sus

      productHelpers.getProduct(proId).then((products) => {
        console.log(products, "PRODUCTS");
        res.render("user/view-product", { products, user, cartCount });
      });
    } catch (error) {
      console.log(error);
    }
  },

  getAddToCart: async (req, res) => {
    try {
      // req.session.returnUrl = req.originalUrl;
      // console.log(req.params.id,"===req.params.id")
      // console.log(req.session.user,"===req.session.user")
      cartHelpers
        .addToCart(req.params.id, req.session.user)
        .then(() => {
          console.log("ADDED TO CART AND RIDIRECTING");

          res.json({ status: true });
        })
        .catch((err) => {
          console.log("catch error in .then()");
        });
    } catch (error) {
      console.log("error in getADDToCart");
    }
  },
  Cart: async (req, res) => {
    try {
      let user = req.session.user;
      let cartCount = await cartHelpers.getCartCount(user);
      console.log(cartCount);
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
      console.log("USERRRR", user);
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
      console.log("req.body", req.body);
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
      console.log("HEEEEEEEEEREREERERERER");
      console.log(req.body, req.session.user._id);
      cartHelpers
        .deleteCartProduct(req.body, req.session.user._id)
        .then((response) => {
          res.json(response);
        })
        .catch((err) => {
          console.log("ERROR IN REMOVE CART");
        });
    } catch (error) {
      console.log("error is remove cart catch");
    }
  },
  getOrder: async (req, res) => {
    let cartItems = await cartHelpers.getCartProduct(req.session.user);
    let address = await db.address.find({ user: req.session.user._id });
    // console.log(address)
    console.log(cartItems.quantity);

    let totalPrice = await cartHelpers.getTotal(req.session.user._id);
    let user = req?.session?.user;
    console.log("KIKIKIKIKIKI", req.body, "KIKIKIKIKI");
    res.render("user/order", {
      user: req.session.user,
      totalPrice,
      cartItems,
      address,
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
    // let orders = await orderHelpers.getOrders(req.session.user._id);
    let orders = await orderHelpers.getOrders(user); // when db.collection name is called without await the whole schema comes so use await db.orders.find({})
    console.log("123456", orders);
    res.render("user/order-success", { user, orders });
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
  filterProduct: async (req, res) => {
    let catName = req.params.id;
    let user = req?.session?.user;
    console.log(user);
    let cartCount = await cartHelpers.getCartProduct(user);
    let category = await productHelpers.getAllProducts();
    console.log("1234567", category);
    productHelpers.filterCategory(catName).then((filterproducts) => {
      console.log(filterproducts.length, "dibu");
      res.render("user/filter", { user, filterproducts, cartCount, category });
    });
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
  getprofilePage: async (req, res) => {
    // let user = req?.session?.user;

    // let address = await db.address.find({ user: req.session.user._id });
    // console.log("in user controller",address)

    // res.render("user/profile", { user, address });

    try {
      orderHelpers.getAdminOrders().then((data) => {
        console.log("WORKING", data);

        res.render("user/profile", { data });
      });
    } catch (error) {
      console.log("errrorr");
    }
  },
  changePassword: (req, res) => {
    try {
    } catch {}
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
      console.log(proId, "ooo");
      wishlistHelpers
        .addToWishlist(proId, user)
        .then((response) => {
          res.json(response.status);
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
  }
};
