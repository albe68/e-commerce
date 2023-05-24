const mongoose = require("mongoose");
const db = mongoose.createConnection("mongodb://0.0.0.0:27017/store");
const { ObjectID } = require("bson");
const { ObjectId } = require("mongodb");

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("We're connected to the database!");
});

//User Schema

const userSchema = new mongoose.Schema({
  username: { type: String },
  email: { type: String },
  phoneNumber: { type: String },
  password: String,
  status: {
    type: Boolean,
    default: true,
  },
  blocked:{
    type:Boolean,
    default:false
  },
  coupon: Array,

});

//Products Schema
const productSchema = new mongoose.Schema({
  
  name: { type: String },
  description: { type: String },
  price: { type: Number },

  quantity: { type: Number },
  category: { type: String },
  Image: {  type: Array}, //changed for list and unlist
  status: {
    type: Boolean,
    default: true,
  },
});

const categorySchema = new mongoose.Schema({
  category: { type: String },
});

const adminSchema = new mongoose.Schema({
  email: { type: String },
  password: { type: String },
});
const cartSchema = new mongoose.Schema({
  user: ObjectId,
  cartProducts: [
    {
      item: mongoose.Types.ObjectId,
      quantity: Number,

    },
   
  ],
  totalPrice:{ type: Number }
});
const orderSchema = new mongoose.Schema({
  userId: mongoose.Types.ObjectId,
  orders: [
    {
      fName: String,
      lName: String,
      mobile: Number,
      paymentMethod: String,
      productDetails: [{}],
      totalPrice: Number,
      totalQuantity: Number,
      shippingAddress: Object,
      email: String,
      createdAt: Date,
      uuid: String,
      paymentStatus: {
        type: String,
        default: "pending",
      },
      orderStatus:{
        type: String,
       
      },
      status: {
        type: Boolean,
        default: true,
      },
    },
  ],
});


// addressSchema

const addressSchema = new mongoose.Schema({
  user: mongoose.Types.ObjectId,
  address: [
    {
      fName: String,
      lName: String,
      address: String,
      landmark: String,
      town: String,
      country: String,
      postcode: Number,
      mobile: Number,
      email: String,
    },
  ],
});

const wishlistSchema=new mongoose.Schema({
  user:mongoose.Types.ObjectId,
  wishItems: [
    {
      productId: mongoose.Types.ObjectId,
      
    },
  ],
  addedAt:{
    type:Date,
    default:Date.now
  }
})

const otpSchema = new mongoose.Schema({
  otp: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const couponSchema=new mongoose.Schema({
  coupon: String,
  discountType: String,
  amount: Number,
  amountValidity: String,
  cappedAmount:Number,
  percentage: Number,
  description: String,
  createdAt: {
      type: Date,
      default: new Date()
  },
  validityTill: Date,
  usageValidity: Number



})
module.exports = {
  user: db.model("user", userSchema),
  admin: db.model("admin", adminSchema),
  products: db.model("products", productSchema),
  category: db.model("category", categorySchema),
  cart: db.model("cart", cartSchema),
  order: db.model("order", orderSchema),
  address: db.model("address", addressSchema),
  wishlist:db.model("wishlist",wishlistSchema),
  otp:db.model("otp",otpSchema),
  coupon:db.model("coupon",couponSchema)
};
