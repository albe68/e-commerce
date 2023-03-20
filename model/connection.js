

const mongoose = require("mongoose");
const db = mongoose.createConnection(
  "mongodb://0.0.0.0:27017/store" 
);
const {ObjectID}=require("bson")
const {ObjectId}=require("mongodb");


db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("We're connected to the database!");
});



//User Schema

const userSchema=new mongoose.Schema({
  username:{type:String},
  email:{type:String},
  phoneNumber:{type:String},
  password:String,
  status:{
    type:Boolean,
    default:true
  }
});

//Products Schema
const productSchema = new mongoose.Schema({
  
  name: {type:String},
  description:{type:String},
  price: {type:String},

  // brand: {type:String},
  // quantity: {type:Number},
  category:{type:String},
  image:{
    data:Buffer,
    contentType:String
  }
});

const categorySchema=new mongoose.Schema({
  category:{type:String}

})

const adminSchema=new mongoose.Schema({
  email:{type:String},
  password:{type:String}
})
const cartSchema=new mongoose.Schema({
  user:ObjectId,
  cartProducts:[
    {
      item:mongoose.Types.ObjectId,
      quantity:Number,
    }

  ],

});

module.exports={
  user:db.model("user",userSchema),
  admin:db.model("admin",adminSchema),
  products:db.model("products",productSchema),
  category:db.model("category",categorySchema),
  cart:db.model("cart",cartSchema),
  }
