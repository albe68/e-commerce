const { user } = require("../model/connection");
const db = require("../model/connection");

module.exports = {
  //add-to-cart

  addToCart: (proId, user) => {
    proObj = {
      item: proId,
      quantity: 1
    };
    return new Promise(async (resolve, reject) => {
      let userCart = await db.cart.findOne({ user: user._id });
     
      if (userCart) {
        let prodExist = userCart.cartProducts.findIndex(
          (cartProducts) => cartProducts.item == proId
        );
        if (prodExist != -1) {
         
          db.cart
            .updateOne(
              {
                user: user._id,
                "cartProducts.item": proId,
              },
              {
                $inc: {
                  "cartProducts.$.quantity": 1,
                },
              }
            )
            .then(() => {
              //
              resolve();
            })
            .catch((err) => reject({ error: "Unauthorized 1" }));
        } else {
          db.cart
            .updateOne(
              { user: user._id },
              {
                $push: {
                  cartProducts: proObj,
                },
              }
            )
            .then(() => {
             
              resolve();
            })
            .catch((err) => reject({ error: "Unauthroized 2" }));
        }
      } else {
        let cartObj = {
          user: user._id,
          cartProducts: [proObj],
        };
        db.cart(cartObj)
          .save()
          .then(() => {
            resolve();
          });
        // .catch((err)=>reject({error:"Unauthorized Action"}));
      }
    });
  },

  //get-Cart-Product//
  getCartProduct: (user) => {
    return new Promise((resolve, reject) => {
      db.cart
        .aggregate([
          {
            $match: { user: user._id },
          },
          {
            $unwind: "$cartProducts",
          },
          {
            $project: {
              item: "$cartProducts.item",
              quantity: "$cartProducts.quantity",
            },
          },
          {
            $lookup: {
              from: "products",
              localField: "item",
              foreignField: "_id",
              as: "cartItems",
            },
          },
          {
            //error in this below line, now working
            $project: {
              item: 1,
              quantity: 1,
              Products: {
                $arrayElemAt: ["$cartItems", 0], //assign first element [0] of cartItems array to Products
              },
            },
          },
        ])
        .then((cartItems) => {
          //
          resolve(cartItems);
        });
    });
  },
  getCartCount: (user) => {
    return new Promise((resolve, reject) => {
      let cartCount = 0;
      db.cart
        .findOne({ user: user?._id })
        .then((cart) => {
          if (cart) {
            for (let i = 0; i < cart.cartProducts.length; i++) {
              cartCount += cart.cartProducts[i].quantity;
            }
          }
          resolve(cartCount);
        }) 
        .catch((err) => {
          console.log("ERROR IN CART COUNT",err);
        });
    });
  },
  changeProductQuantity: (details, user) => {
   
    const id = details.product;
    const cartId = details.cart;

    count = parseInt(details.count);
    quantity = parseInt(details.quantity);

    return new Promise((resolve, reject) => {
      //when quantity is not 0 and count is decreased
      if (details.count == -1 && details.quantity == 1) {
        db.cart
          .updateOne(
            { user: user },
            {
              $pull: {
                cartProducts: { item: id },
              },
            }
          ) //changed .then(e) to .then(response)
          .then((response) => {
            resolve({ removeProduct: true });
          })
          .catch((err) => {
            reject({ error: "Unauthorized Action" });
            console.log(err);
          });
      }
      db.cart
        .updateOne(
          { _id: cartId, "cartProducts.item": id },
          {
            $inc: {
              "cartProducts.$.quantity": details.count,
            },
          }
        ) //changed no .then() to .then(response)
        .then((response) => {
          resolve({ status: true });
        })
        .catch((err) => {
          reject({ error: "Unauthorized Action" });
          console.log(err);
        });
    });
  },
  // Delete Cart Product //

  deleteCartProduct: (data, user) => {
    return new Promise((resolve, reject) => {
     
      try {
        const id = data.product;
       
        db.cart
          .updateOne(
            { user: user },
            {
              $pull: {
                cartProducts: { item: id },
              },
            }
          )
          .then((e) => {
           
            resolve({ removeProduct: true });
          })
          .catch((err) => reject({ error: "Unauthorized Action" }));
       
      } catch (error) {
       
        reject({ error: "Unauthorized Action" });
      }
    });
  },

  getTotal: (userId) => {
   
    return new Promise(async (resolve, reject) => {
      try {
        db.cart
          .aggregate([
            {
              $match: {
                user: userId,
              },
            },
            {
              $unwind: "$cartProducts",
            },
            {
              $project: {
                item: "$cartProducts.item",
                quantity: "$cartProducts.quantity",
              },
            },
            {
              $lookup: {
                from: "products",
                localField: "item",
                foreignField: "_id",
                as: "cartItems",
              },
            },
            {
              //error in this line, now working
              $project: {
                item: 1,
                quantity: 1,
                Products: {
                  $arrayElemAt: ["$cartItems", 0], //assign first element [0] of cartItems array to Products
                },
              },
            },
            {
              $group: {
                _id: null,
                total: {
                  //Products values are coming in strings so convert to numbe using $toDouble
                  $sum: {
                    $multiply: [
                      { $toDouble: "$Products.price" },
                      { $toDouble: "$quantity" },
                    ],
                  },
                },
              },
            },
          ])
          .then((total) => {
           
            totalAmount = total[0].total; //error when cart is deleted asking for this .total value
            resolve(totalAmount);
          });
      } catch (error) {
        console.log(error);
      }
    });
  },
  getCartProductList: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cart = await db.cart.findOne({ user: userId });

      resolve(cart.cartProducts);
    });
  },
  checkCartQuantity:async(userId,proId)=>{
    return new Promise(async(resolve,reject)=>{
      try{
        let cart=await db.cart.findOne({user:userId});
        if(cart){
          let cartIndex=cart?.cartProducts?.findIndex(
            (cart)=>cart.item==proId);
            if(cartIndex== -1){
              let quantity=0;
              resolve({status:true,quantity:quantity})
            }else{
              let quantity=cart?.cartProducts[cartIndex]?.quantity;
              resolve({status:true,quantity:quantity})
            }
        }
        else{
          resolve({status:false})
        }
      }
      catch(error){
        console.log(error)
      }
    })
  },
  applyCoupoun:(data,user, total)=>{
    return new Promise(async (resolve, reject) => {
      try {
        let couponData = await db.coupon.findOne({ coupon: data });
        if (couponData) {
          if (new Date(couponData.validityTill) - new Date() > 0 &&couponData.usageValidity > 0)
           {
            let amountValid = couponData.amountValidity.split("-");
            //if discountType is amount
            if (couponData.discountType == "Amount") {
             
              if (total >= amountValid[0] && total <= amountValid[1]) {
                let discountAmount = Math.floor(couponData.amount);
                let finalAmount = Math.floor(total - couponData.amount);
                resolve({ finalAmount, discountAmount });
              } 
              //this is now working ::1st time
              else {
                resolve({ couponNotApplicable: true, amountValid });
              }
            } 
                        //if discountType is percentage

            else {
             
              if (total >= amountValid[0] && total <= amountValid[1]) {
                let cappedAmount = couponData?.cappedAmount;
                let discountAmount = await ((total * couponData.percentage) /
                  100);
                if (discountAmount > cappedAmount) {
                  discountAmount = cappedAmount;
                  let finalAmount = Math.floor(total - discountAmount);
                 
                  resolve({ finalAmount, discountAmount });
                } 
                
                else {
                 

                  let finalAmount = Math.floor(total - discountAmount);
                  discountAmount = Math.floor(discountAmount);
                  resolve({ finalAmount, discountAmount });
                }
              }
              //coupon not applicable
               else {
               
                resolve({ couponNotApplicable: true, amountValid });
              }
            }
          }//couponExpired
           else {
            resolve({ couponExpired: true });
          }
        }
      } catch (error) {
        console.error(error);
        reject({ error: "Unauthorized Action" });
      }
    });
      },
      discountTotal:(userId,proId)=>{
        return new Promise(async(resolve,reject)=>{
          
          let order=await db.cart.findOne({user:userId});
          if(cart){
            let orderindex = order[0].orders.findIndex(
              (order) => order._id == body.orderId
            );
              if(cartIndex== -1){
                let quantity=0;
                resolve({status:true,quantity:quantity})
              }else{
                let quantity=cart?.cartProducts[cartIndex]?.quantity;
                resolve({status:true,quantity:quantity})
              }
          }
          else{
            resolve({status:false})
          }
          const id=await db.order.aggregate([
            {
              $match:{
                user:userId

              }
            },
            {
              $unwind:'$cartProducts',
            },{
              $project:{
               item: 'cartProducts.item',
               quantity:'cartProducts.quantity'

              }

            },{
              $lookup:{
                from:'products',
                localField:'item',
                foreignField:'_id',
                as:'cartItems'

              }
            },{
              $project:{
                item:1,
                quantity:1,
                cartProducts:{$arrayElemAt:["$cartItems",0]}
              }
            }
          ])
        })

      }
};


