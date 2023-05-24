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
      return new Promise(async (resolve, reject) => {
        try {
          discountAmount = data.amount == "" ? 0 : parseInt(data.amount);
          discountPercentage =
            data.percentage == "" ? 0 : parseInt(data.percentage);
          cappedAmount =
            data?.cappedAmount == "" ? 0 : parseInt(data?.cappedAmount);
          let couponObj = {
            coupon: data.coupon,
            discountType: data.discountType,
            amount: discountAmount,
            amountValidity: data.amountValidity,
            cappedAmount: cappedAmount,
            percentage: discountPercentage,
            validityTill: data.validity,
  
            description: data.description,
            usageValidity: data.redeemTime,
          };
          let coupon = await db.coupon(couponObj);
  
          await coupon.save();
          resolve({ status: true });
        } catch (error) {
          console.log(error);
          reject({ error: "Unauthorized Action" });
        }
      });
    },
    verifyCoupon:(data,user)=>{
       
        try{
            let couponName=data.coupon_Name
            return new Promise((resolve,reject)=>{
                db.coupon.findOne({couponName:couponName}).then(async (reponse)=>{
                    if(reponse){
                        let couponExist = await db.user.findOne({
                            _id: user,
                            coupon: couponName,
                          });
                         
                          //if not coupon Exist
                          if (!couponExist) 
                          {
                           

                            let couponData = {
                              name: couponName,
                              purchased: false,
                            };
                           
                            db.user
                              .updateOne(
                                { _id: user },
                                {
                                  $push: {
                                    coupon: couponData
                                  }
                                }
                              )
                              .then((e) => {
                               
                                resolve({ status: true });
                              });
                          } 
                          //if Coupun exists
                          else {
                            resolve({ coupon: true });
                          }   
                    }
                    else{
                        resolve({ status: false });

                    }
                })
            })
        }catch(err){console.log(err)}
    },
    couponChecked: (data, userId) => {
        return new Promise(async (resolve, reject) => {
          try {
            let purchased = await db.user.aggregate([
              {
                $match: { _id: userId },
              },
              {
                $unwind: "$coupon",
              },
              {
                $match: {
                  $and: [
                    {
                      "coupon.name": data,
                      "coupon.purchased": false,
                    },
                  ],
                },
              },
            ]);
           
            if (!purchased.length) {
             
              resolve({ purchased: true });
            } else {
             

              resolve({ purchased: false });
            }
          } catch (error) {
            reject({ error: "Unauthorized Action" });
          }
        });
      },
      applyCoupon: (data, user, total) => {
        return new Promise(async (resolve, reject) => {
          try {
            let couponData = await db.coupon.findOne({ coupon: data });
            if (couponData) {
              if (
                new Date(couponData.validityTill) - new Date() > 0 &&
                couponData.usageValidity > 0
              ) {
                let amountValid = couponData.amountValidity.split("-");
                if (couponData.discountType == "Amount") {
                  if (total >= amountValid[0] && total <= amountValid[1]) {
                    let discountAmount = Math.floor(couponData.amount);
                    let finalAmount = Math.floor(total - couponData.amount);
                    resolve({ finalAmount, discountAmount });
                  } else {
                    resolve({ couponNotApplicable: true, amountValid });
                  }
                } else {
                  if (total >= amountValid[0] && total <= amountValid[1]) {
                    let cappedAmount = couponData?.cappedAmount;
                    let discountAmount = await ((total * couponData.percentage) /
                      100);
                    if (discountAmount > cappedAmount) {
                      discountAmount = cappedAmount;
                      let finalAmount = Math.floor(total - discountAmount);
                      resolve({ finalAmount, discountAmount });
                    } else {
                      let finalAmount = Math.floor(total - discountAmount);
                      discountAmount = Math.floor(discountAmount);
                      resolve({ finalAmount, discountAmount });
                    }
                  } else {
                    resolve({ couponNotApplicable: true, amountValid });
                  }
                }
              } else {
                resolve({ couponExpired: true });
              }
            }
          } catch (error) {
            console.error(error);
            reject({ error: "Unauthorized Action" });
          }
        });
      },
      deleteCoupon: (copId) => {
        return new Promise(async (resolve, reject) => {
          try {
            await db.coupon.deleteOne({ _id: copId }).then((e) => {});
            resolve();
          } catch (error) {
            console.log(error);
            reject({ error: "Unauthorized Action" });
          }
        });
      },
    getAllCoupon:()=>{
        return new Promise((resolve,reject)=>{
            db.coupon.find({}).then((allCoupon)=>{
               
                resolve(allCoupon)

            })
        })
    }

      
}