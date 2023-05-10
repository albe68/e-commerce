// const { rejects } = require("assert"); --------what is rejects?
const { rejects } = require("assert");
// const { orders } = require("../controller/userController");
const { user, products } = require("../model/connection");
var ObjectId = require("mongodb").ObjectId;
const db = require("../model/connection");
const { resolve } = require("path");
const Razorpay = require("razorpay");
var instance = new Razorpay({
  key_id: "rzp_test_HzJZCWFkUXcuQj",
  key_secret: "MarcF2ircaxqW5jFjgQg7ZKE",
});
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
          user: user,
          address: orderAddress,
        };
        let addressDoc = await db.address.findOne({ user: user });
        console.log("true");
        if (addressDoc) {
          db.address
            .find({
              "address.fname": order.fName,
              "address.lName": order.lName,
              "address.postcode": order.postcode,
              "address.mobile": order.mobile,
            })
            .then((res) => {
              if (res.length == 0) {
                db.address
                  .updateOne(
                    { user: user },
                    {
                      $push: {
                        address: orderAddress,
                      },
                    }
                  )
                  .then((data) => {})
                  .catch((err) => console.log(err));
              } else {
                console.log("exits");
              }
            })
            .catch((err) => console.log(err));
        } else {
          let addressdata = await db.address(addressObj);
          await addressdata.save();
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
              shippingAddress: address, //changed from order.billing_address to address
              email: order.email,
              createdAt: new Date(),
              orderStatus: status,
              
              productDetails: product,
              totalPrice: total,
            },
          ],
        };

        let user_order = await db.order.findOne({ userId: user });

        if (user_order) {
          db.order
            .updateOne(
              {
                userId: user,
              },
              {
                $push: {
                  orders: [
                    {
                      fName: order.fname,
                      lName: order.lname,
                      mobile: order.phone,
                      paymentMethod: order.paymentMethod,
                      shippingAddress: address, //changed from order.billing_address to address
                      email: order.email,
                      createdAt: new Date(),
                      orderStatus: status,
                      productDetails: product,
                      totalPrice: total,
                    },
                  ],
                },
              }
            )
            .then((a) => {})
            .catch((err) => console.log(err));
        } else {
          let orderData = db.order(orderObj);

          orderData.save();
        }
        console.log("55555555555555555555555555555555555555");

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
  cancelOrder: (body, userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log("hsjhasjhasjkahsjkhasjhasjkhasjkhaksjhaskas", body);
        let order = await db.order.find({ "orders._id": body.orderId });
        console.log(
          "88888888888888888888888888",
          order,
          "8888888888888888888888"
        );
        let orderindex = order[0].orders.findIndex(
          (order) => order._id == body.orderId
        );
        console.log(
          "--------------------",
          orderindex,
          "------------------------"
        );

        console.log("11111111111111111111111", orderindex);
        await db.order
          .updateOne(
            { "orders.orderindex._id": body.orderid },
            {
              $set: {
                ["orders." + orderindex + ".orderStatus"]: "canceled",
              },
            }
          )
          .then(async (orders) => {
            console.log("sjakjskasjaks", orders);
            resolve(orders);
          });
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
  updateOrder: (data) => {
    
    let orderId = data.orderId.trim();
    console.log({ orderId }, "line 322");
    //just look at the $orderId if any error happens
    return new Promise(async (resolve, reject) => {
      try {
        let order = await db.order.find({ "orders._id": orderId });
        console.log(order, "line 327");
        if (order) {
          //might should add order Index like this orders[0].
          let orderIndex = order[0].orders.findIndex(
            (order) => order._id == orderId
          );
          console.log("line 331", orderIndex);
          db.order
            .updateOne(
              { "orders.orderindex._id": "${orderId}" },
              {
                $set: {
                  ["orders." + orderIndex + ".orderStatus"]: "Delivered",
                },
              }
            )
            .then(async (e) => {
              if (data.delivery == "Delivered") {
                console.log("Delivered");
                let updateDelDate = await db.order.updateOne(
                  { "orders._id": orderId },
                  {
                    $set: {
                      ["orders." + orderIndex + ".deliveredAt"]: new Date(),
                    },
                  }
                );
                console.log(updateDelDate, "line");
              }
              resolve({ status: true });
            })
            .catch((err) => {
              console.log(err);
            });
        }
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
  generateRazorPay: async (userId, total) => {
    const OrderDetails = await db.order.find({ userId: userId });
    let length = OrderDetails[0].orders.length;
    let orderId = OrderDetails[0].orders[length - 1]._id;
    let userName = OrderDetails[0].orders[length - 1].fName;
    let mobile = OrderDetails[0].orders[length - 1].shippingAddress.mobile;
    let email = OrderDetails[0].orders[length - 1].shippingAddress.email;
    console.log(
      "length:",
      length,
      "orderId:",
      orderId,
      "userName:",
      userName,
      "mobile:",
      mobile,
      "email:",
      email
    );
    total = total * 100;
    return new Promise((resolve, reject) => {
      try {
        var options = {
          amount: total,
          currency: "INR",
          receipt: "" + orderId,
        };
        instance.orders.create(options, function (err, order) {
          if (err) {
            console.log("razerpayErr:" + err);
          }
          order.userName = userName;
          order.mobile = mobile;
          order.email = email;
          console.log("375 line");
          resolve(order);
        });
      } catch (err) {
        console.log(err);
        reject({ error: "Unauthorized Action" });
      }
    });
  },
  verifypayment: (data) => {
    return new Promise((resolve, reject) => {
      try {
        
      } catch {}
    });
  },
  changePaymentStatus: (userId, orderId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let orders = await db.order.find({ userId: userId }); //doubt in this re check
        let orderIndex = orders[0].orders.findIndex(
          (order) => order._id == body.orderId
        );
        db.order
          .updateOne(
            {
              "orders._id": orderId, //may be we should you ObjectId(orderId)
            },

            { 
              $set: {
                ["orders." + orderIndex + ".paymentStatus"]: "PAID",
              },
            }
          )
          .then((res) => {
            resolve();
          })
          .catch((err) => {
            console.log(err);
          });
      } catch {}
    });
  },
  getCodCount:()=>{
    return new Promise (async(resolve,reject)=>{
      let response=await db.order.aggregate([
        {
          $unwind:"$orders"
        },{
          $match:{
            "orders.paymentMethod":"COD"
          }
        }
      ])
      resolve(response)
    })
  },
  razorPayCount:()=>{
    return new Promise (async(resolve,reject)=>{
      let response=await db.order.aggregate([
        {
          $unwind:"$orders"
        },{
          $match:{
            "orders.paymentMethod":"razorpay"
          }
        }
      ])
      resolve(response)
    })
  },
  getOrderByDate:async()=>{

    try {
      const startDate = new Date('2022-01-01');
      let orderDate = await db.order.find({ createdAt: { $gte: startDate } });
      console.log("orderDate",orderDate);
      return orderDate
    }
    catch (err) {
      console.log(err);
    }

  },

  getAllOrders: () => {
    return new Promise(async (resolve, reject) => {
      await db.products.find({}).then((response) => {
        resolve(response)
      })
    })
  },
  viewOrderDetails:(orderId)=>{
    return new Promise(async (resolve,reject)=>{
      let proId=await db.order.findOne({"orders._id":orderId},{'orders.$':1})

      let details=proId.orders[0];
      let order=proId.orders[0].productDetails;

      const productDetails=proId.orders.map(object=> object.productDetails);
      const address=proId.orders.map(object=>object.shippingAddress);
      const products=productDetails.map(object=>object)

      resolve({products,address,details})
    })
  },
  orderDetails:(orderId,userId)=>{
    return new Promise(async(resolve,reject)=>{
      const convertObjectOrderId = new ObjectId(orderId);
    const hi=  typeof(objId)
    console.log(hi,"123")
      let order = await db.order.find({ "orders._id": convertObjectOrderId });
      console.log(order,"ttt")
      let orderIndex = order[0].orders.findIndex(
        (order) => order._id == convertObjectOrderId
      );
   db.order.aggregate([
      {  $match:{
          userId:userId
        }
      },
        
      {
        $unwind:'$orders'
      },
    
      {
        $project:{
          productDetails: "$orders.productDetails"
          
        }
      },{
        $unwind:'$productDetails'
      }
      
    
    
    ]).then(data=>{
      console.log(data,"halo")
      resolve(data)

    })
    })
  }
};
