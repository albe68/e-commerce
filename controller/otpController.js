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
const otp=require("../middleware/otp/otp")
const client = require("twilio")(otp.accountSid, otp.authToken);

module.exports={
    getUserOtpLogin: (req, res) => {
        // let userIn=req.session.userLoggedIn
        // let user=req.session.user._id
      
          res.render("user/otpLogin");
        },
        postUserOtpLogin:async(req,res)=>{
         try{
          number=req.body.number;
          let users=await db.user.find({phoneNumber:number}).exec();
          console.log(colors.green('userIn: %s'), number,req.body,users);
      
          loggedUser=users;
          if(users==false){
            res.redirect("/login")
          }
          else{
            console.log(colors.green('else case worked%s'), number,req.body);
            client.verify.v2
        .services(otp.verifySid)
        .verifications.create({ to: `+91 ${number}`, channel: "sms" })
        .then((verification) => console.log(verification.status))
        .then(() => {
          const readline = require("readline").createInterface({
            input: process.stdin,
            output: process.stdout,
          });
          res.render("user/otpEntering")
      
       
        });
          }
         }
         catch(err){
          console.log(err)
         } 
        },
        postOtpVerify:async(req,res)=>{
          try{
            let user = req?.session?.user;

            let cartCount = await cartHelpers?.getCartCount(user);
            let category = await productHelpers.getAllcategory();
           
            otpNumber=req.body.otp;
           await   client.verify?.v2
                .services(otp.verifySid)
                .verificationChecks.create({ to: `+91 ${number}`, code: otpNumber })
                .then((verification_check) =>{ console.log(verification_check.status)
                    
                if(verification_check.valid==true){
                  let id=loggedUser[0]._id;
                  req.session.user={loggedUser,id};
                 
                //   req.session.userLoggedIn=true;
                  req.session.userIn = true;

                  userSession=req.session.userLoggedIn;
                  res.render("user/user",{user,cartCount,category,userSession}) 
                }
                else{
                   
                  res.redirect("/otp-verify")
                }
              })
           
            }
          catch(error){
            console.log(error)
          }
        }
        ,
        getOtpVerify:(req,res)=>{
          res.render("user/otp-entering")
        },
}