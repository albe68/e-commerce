const db=require("../model/connection")
var voucher_codes = require('voucher-code-generator');
const cartHelpers=require("../helpers/cartHelpers")

const objectId=require("mongodb").ObjectId
module.exports={



    generateCoupon:()=>{
        return new Promise((resolve,reject)=>{
         try{
            const couponCode=    voucher_codes.generate({
                length: 3,
                count: 5,
                prefix: "GS-",
                charset: "0123456789"
                
            });
            resolve({status:true,couponCode:couponCode[0]})
         }
         catch(error){
            console.log(error)
         }
        })
    
    },
    addNewCoupon:(data)=>{
        return new Promise((resolve,reject)=>{
            try{
                db.coupon(data)
                .save().then(()=>{
                    resolve({status:true})
                });
            }
            catch(err){
                console.log(err)
            }
        })
    },
    couponStatus:async(couponDetails)=>{
        try{
            
        }
        catch(err){
            console.log(err)
        }
    },
      
}