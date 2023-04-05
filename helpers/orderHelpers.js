// const { rejects } = require("assert"); --------what is rejects?
const { orders } = require("../controller/userController");
const { user, products } = require("../model/connection");
var ObjectId = require("mongodb").ObjectId;
const db = require("../model/connection");
const { resolve } = require("path");

module.exports = {
  placeOrder: (order, total, products, user) => {
    //aysync moved with P.O
    try {
      console.log(
        "rrrrrrrrrrrrrrrrrrrrrrrrrr",
        user,
        "rrrrrrrrrrrrrrrrrrrrrrrrrrrr"
      );
      //aggregation pipeline 1 for product
      return new Promise(async (resolve, reject) => {
        let product = await db.cart.aggregate([
          {
            $match: {
              user: user,
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
              as: "cartItems", //cart Items has item and id
            },
          },
          {
            $unwind: "$cartItems",
          },
          {
            $set: { cartItems: { status: true } },
          },
          {
            $set: { cartItems: { Delivery: "Processing" } },
          },
          {
            $set: { cartItems: { deliveredAt: undefined } },
          },
          {
            $project: {
              _id: "$cartItems._id",
              quantity: 1,
              productName: "$cartItems.name",
              productPrice: "$cartItems.price",
              status: "$cartItems.status",
              Delivery: "$cartItems.Delivery",
              deliveredAt: "$cartItems.deliveredAt",
            },
          },
        ]);

        let totalQuantity = 0;
        for (let i = 0; i < product.length; i++) {
          totalQuantity += await product[i].quantity;
          await db.products.updateOne(
            { _id: product[i]._id },
            {
              $inc: { quantity: -product[i].quantity },
            }
          );
        }
       
        console.log("TOTAL QUANTITY", totalQuantity, "TOTAL QUANTITY");

        console.log("jsajslkaljsklajskajsklajskajlksa", product);
        let status = order.paymentMethod === "COD" ? "placed" : "pending";

        let orderAddress = {
          fName: order.fname,
          lName: order.lname,
          address: order.billing_address,
          landmark: order.landmark,
          town: order.town,
          postcode: order.postcode,
          mobile: order.phone,
          email: order.email,
        }; 
        //adress objext with user and order address details
        let addressObj = {
          user: user,                              controller/adminController.js
          modified:   controller/auth.js
          modified:   controller/dummy.js
          modified:   controller/userController.js
          modified:   helpers/cartHelpers.js
          modified:   helpers/orderHelpers.js
          address: orderAddress,
        };
        let addressDoc=await db.address.findOne({user:user})
        console.log("true")
        if(addressDoc){
          db.address.find({
            "address.fname":order.fName,
            "address.lName":order.lName,
            "address.postcode":order.postcode,
            "address.mobile":order.mobile
          }).then((res)=>{
            if (res.length == 0) {
              db.address
                .updateOne(
                  { user:user },
                  {
                    $push: {
                      address: orderAddress,
                    },
                  }
                )
                .then((data) => {

                })
                .catch((err) => console.log(err));
            } else {
              console.log("exits");
            }
          })
          .catch((err)=>console.log(err));
        }
          else{
            let addressdata=await db.address(addressObj);
            await addressdata.save()
          } 

          let address = {
            address: order.address,
            landmark: order.landmark,
            town: order.town,
            city: order.city,
            country: order.country,
            postcode: parseInt(order.postcode),
            mobile: parseInt(order.mobile),
            email: order.email,
          };

        

        let orderObj = {
          userId: user,
          orders: [
            {
              fName: order.fname,
              lName: order.lname,
              mobile: order.phone,
              paymentMethod: order.paymentMethod,
              shippingAddress: address,   //changed from order.billing_address to address
              email: order.email,
              createdAt: new Date(),
              paymentStatus: status,
              productDetails: product,
              totalPrice:total
            },
          ],
        };

        
      


        let user_order = await db.order.findOne({ userId: user });

        if(user_order){
          db.order.updateOne({
            userId:user
          },
          {
            $push:{
              orders:[
                {
              fName: order.fname,
              lName: order.lname,
              mobile: order.phone,
              paymentMethod: order.paymentMethod,
              shippingAddress: address,   //changed from order.billing_address to address
              email: order.email,
              createdAt: new Date(),
              paymentStatus: status,
              productDetails: product,
              totalPrice:total
                }
              ]
            }
          }
          
          ).then((a)=>{

          })
          .catch((err)=>console.log(err))
        }
        else{
          let orderData = db.order(orderObj);

        orderData.save();
        }
        console.log("55555555555555555555555555555555555555")

        // resolve(orderData)

        //Deleting from cart after  placing order
        db.cart
          .deleteMany({ user: user })
          .then((res) => {
            console.log("RESOLVED");
            resolve({ status: true });
          })
          .catch((err) => {
            console.log(err);
          });
      });

      
    } catch (error) {
      console.log("ERROR");
    }
    let address = {
      address: order.address,
      landmark: order.landmark,
      town: order.town,
      city: order.city,
      country: order.country,
      postcode: parseInt(order.postcode),
      mobile: parseInt(order.mobile),
      email: order.email,
    };
  },

  getAdminOrders: () => {
    return new Promise((resolve, reject) => {
      try {
        db.order
          .aggregate([
            {
              $unwind: "$orders",
            },

            // {
            //   $unwind: "$orders.productDetails", //unwind product details to get the all ordered products with quantity check the collections.
            // },                                   //to get every single products of product Details
            {
              $sort: { "orders.createdAt": -1 },
            },
          ])
          .then((data) => {
            console.log(data);
            resolve(data);
          })
          .catch((err) => reject({ error: "Unauthorized Action" }));
      } catch (error) {
        reject({ error: "Unauthorized Action" });
      }
    });
  },
  cancelOrder: (body,userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log("hsjhasjhasjkahsjkhasjhasjkhasjkhaksjhaskas",body)
        let order = await db.order.find({ "orders._id": body.orderId });
        console.log("88888888888888888888888888",order,"8888888888888888888888")
        let orderindex = order[0].orders.findIndex(
          (order) => order._id == body.orderId
        );
          console.log("--------------------",orderindex,"------------------------")
        
       
        console.log("11111111111111111111111",orderindex)
        await db.order.updateOne({'orders.orderindex._id':body.orderid},
        {
          $set:{
            ['orders.'+orderindex+'.paymentStatus']:'canceled'
          }
        } ).then(async(orders)=>{
          console.log("sjakjskasjaks",orders)
          resolve(orders)
        })
       

          

          
     
          
         
          
        
      } catch (error) {
        console.log(error);
      }
    });
  },
  getSingleOrder: () => {
    let order = db.order.find({});
    console.log(order);
  },
  getOrders: async (userId) => {
    return new Promise((resolve, reject) => {
      try {
        db.order
          .aggregate([
            {
              $unwind: "$orders",
            },
            {
              $match: { userId: userId },
            },
            {
              $sort: { "orders.createdAt": -1 },
            },
          ])
          .then((data) => {
            resolve(data);
          })
          .catch((err) => reject({ error: "Unauthorized Action" }));
      } catch (error) {
        console.log(error);
      }
    });
  },
  deleteAddress: (userId, addressId) => {
    return new Promise(async (resolve, reject) => {
      try {
        db.address
          .updateOne(
            {
              userId: userId,
            },
            {
              $pull: { address: { _id: addressId } },
            }
          )
          .then((e) => {
            resolve({ status: true });
          })
          .catch((err) => reject({ error: "Unauthorized Action" }));
      } catch (err) {
        console.log(err);
        reject({ error: "Unauthorized Action" });
      }
    });
  },
};
