// const {response}=require("fpress");
const db=require("../model/connection");
const {wishlist}=require("../model/connection");
const { body } = require("express-validator");
const ObjectId=require("mongodb").ObjectId
const mongoose = require('mongoose');


module.exports={

    addToWishlist:(proId,userId)=>{
        let proObj={
            productId:proId
        }
        

        return new Promise(async(resolve,reject)=>{
          

            
            let wishlist= await db.wishlist.find({user:userId})
            if(wishlist){
                const myObjectId = mongoose.Types.ObjectId(proId);
                let wishIndex=wishlist[0].wishItems.findIndex(
                    (element)=>element.productId==proId)
                }
            

            if(wishlist.length){
                let productExist=wishlist[0].wishItems.findIndex((item)=>{
                    item.productId==proId
                })
                if(productExist==-1){
                    db.wishlist.updateOne({user:userId},
                        {
                            $addToSet:{
                                wishItems:proObj
                            },
                        }).then(()=>{
                            resolve({status:true})
                        });
                }
            }
                else{
                    const newWishlist= new db.wishlist({
                        user:userId,
                        wishItems:proObj
                    });
                    await newWishlist.save().then(()=>{
                        resolve({status:true})
                    })
                }
              
            
        })
    },
    getWishlist:(userId)=>{
        return new Promise (async(resolve,reject)=>{
            await db.wishlist.findOne({user:userId}).then((products)=>{
                resolve(products)
            })
        })
     
    },
    listWishlist:(userId)=>{
        return new Promise((resolve,reject)=>{
            db.wishlist.aggregate([
                {
                    $match:{
                    user:userId
                    }
                },
                {
                    $unwind:'$wishItems'
                },{
                    $project:{
                        item:'$wishItems.productId'
                    }
                },{
                    $lookup:{
                        from:'products',
                        localField:'item',
                        foreignField:'_id',
                        as:'wishListProducts'
                    }
                },{
                    $project:{
                        item:1,
                        wishlist:{
                            $arrayElemAt:['$wishListProducts',0]
                        }
                    }
                }

                
            ]).then(wishlist=>{
                resolve(wishlist)

            })
        })
    },
    deleteWishlist:(body)=>{
   try{    
    
    return new Promise(async(resolve,reject)=>{
      await  db.wishlist.updateOne({_id:body.wishId},
            {

            "$pull":{wishItems:{productId:body.proId}}
        }).then(()=>{
            resolve({removeProduct:true})
        })
    }) 
    }
    catch(error){
        console.log(error)

    }

   
    }
}