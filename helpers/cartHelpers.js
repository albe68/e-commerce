const { user }= require("../model/connection");
const db=require("../model/connection");
module.exports={
    //Add To Cart//

    addToCart:(proId,user)=>{
        
        proObj={
            item:proId,
            quantity:1
        }
        return new Promise(async (resolve,reject)=>{
        let userCart=await db.cart.findOne({user:user._id});
        if(userCart){
            
            let prodExist=userCart.cartProducts.findIndex((cartProducts)=>cartProducts.item==proId)
           if(prodExist!=-1){
            console.log(userCart.cartProducts,"Exists")
            db.cart.updateOne({
                user:user._id,"cartProducts.item":proId},
            {
                $inc:{
                    "cartProducts.$.quantity":1,
                },
            }
                )
                .then(()=>{
                    // console.log("CART HAVE BEEN UPDATED ")
                    resolve();
                })
                .catch((err)=>reject({error:"Unauthorized 1"}));
           } 
           else{
            
            db.cart.updateOne(
                {user:user._id},
                {
                    $push:{
                        cartProducts:proObj,
                    },

                }
            )
            .then(()=>{
                console.log('Product added to Cart for first Time')
                resolve();
            })
            .catch((err)=> reject({error:"Unauthroized 2"}))
           }
            
        }

        else{
            let cartObj={
                user:user._id,
                cartProducts:[proObj],
            };
            db.cart(cartObj).save().then(()=>{
                resolve();

            })
            // .catch((err)=>reject({error:"Unauthorized Action"}));
        }
        });
    },

    //get Cart Product//
    getCartProduct:(user)=>{
        return new Promise((resolve,reject)=>{
            db.cart.aggregate([{
                $match:{user:user._id},
            },
            {
                $unwind:"$cartProducts",
            },
            {
                $project:{
                    item:"$cartProducts.item",
                    quantity:"$cartProducts.quantity"

                },
            },
            {
                $lookup:{
                    from:"products",
                    localField:"item",
                    foreignField:"_id",
                    as:"cartItems",
                },
            },{ //error in this line, now working
                $project:{
                    item:1,
                    quantity:1,
                    Products:{
                        $arrayElemAt:["$cartItems",0]  //Not consoling cause projection is not done (project: Products:0)
                    },
                },
            },

            ])
            .then((cartItems)=>{
                console.log(cartItems,"==cartItems")
                resolve(cartItems);
            })
          
            
        });
    },
    getCartCount:(user)=>{
        return new  Promise((resolve,reject)=>{
            let cartCount=0;
            db.cart.findOne({user:user?._id}).then((cart)=>{
                if(cart){
                    for(let i=0;i<cart.cartProducts.length;i++){
                        cartCount += cart.cartProducts[i].quantity;
                    }
                   
                }
                resolve(cartCount);
            })//write await here// 10:00
          .catch((err)=>{
            console.log("ERROR IN CART COUNT")
          })  
        })
    },
    changeProductQuantity:(details,user)=>{
        console.log(details,"details",user,"user")
        const id=details.product;
        const cartId=details.cart;
        count=parseInt(details.count);
        quantity=parseInt(details.quantity);
        return new Promise((resolve,reject)=>{
            
            if (details.count == -1 && details.quantity == 1) {
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
                )
                .then(() => {
                  resolve({ status: true });
                })
                .catch((err) => {
                  reject({ error: "Unauthorized Action" });
                  console.log(err);
                });
           
        })
    },
 // Delete Cart Product //

 deleteCartProduct: (data, user) => {
    return new Promise((resolve, reject) => {
      console.log("dataaaaaaaaaaaaaaaa",data,user)
      try {
        const id = data.product;
        console.log("helper",id)
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
            console.log('qwertyu')
            resolve({ removeProduct: true });
          })
          .catch((err) => reject({ error: "Unauthorized Action" }));
          console.log("dfghj");
        } 
      
      catch (error) {
        console.log("op")
        reject({ error: "Unauthorized Action" });
      }
    });
  }
 
}