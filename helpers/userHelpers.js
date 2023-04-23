const db=require("../model/connection")
const bcrypt=require('bcrypt')
// const ObjectId=require('objectid')
// const { response } = require("../app")

module.exports={
    //User Signup
    doSignup:(userData)=>{
      
        return new Promise((resolve,reject)=>{
            db.user.find({
                email:userData.email
            })
            .then(async(email)=>{
                let response={};
                
                if(email.length==0){
                    try{
                        // userData.password=userData.password.toString()
                        userData.password=await bcrypt.hash(userData.password,10)
                        let data=db.user(userData);
                        data.save();
                        response.status=true;
                        response.user=data;
                        resolve(response);
                        // console.log("ayi:",response)
                    }catch(error){
                       
                        // console.log(error);
                    }
                     }
                else{
                  return Promise.reject('Username already in use');
                    response.status=false;
                    resolve(response);
                    // console.log("ayila:",response)

                    
                }
            })
        })
    },
    doLogin: (loginData) => {
      // console.log("LOGINDATA:",loginData)
        return new Promise(async (resolve, reject) => {
          try {
            let response = {};
            
            let user = await db.user.findOne({ email: loginData.email });
            if (user) {
              // console.log("hiiiiiiiiiiiiiiii")
              if (user.status) {
                console.log("jaksjalsjaskajsklajskljskajsklajsklajskajs")
                bcrypt
                  .compare(loginData.password,user.password)
                  .then((loginTrue) => {
                    
                    // console.log(loginTrue)
                    if (loginTrue) {
                      // console.log("Login Success")
                      response.status = true;
                      response.user = user;
                      resolve(response);
                    } else {
                      // console.log("Login Failed")
                      response.status = false;
                      response.user = user;
                      resolve(response);
                    }
                  });
              } else {
                response.user = user;
                resolve(response);
              }
            } else {
              response.status = false;
              resolve(response);
            }
          } catch (error) {
            reject({ error: "Unauthorized Action" });
            console.log(error);
          }
        });
      },
      
  //Block User

  blockUser:(userId)=>{
    return new Promise((resolve, reject) => {
        try {
            db.user.updateOne({_id:userId},{
                $set:{
                    status:false,
                }
            }).then(()=>{
                resolve()
            })           
        } catch (error) {
            console.log(error);
        }
    })
  },

  
  //Unblock User

  unblockUser:(userId)=>{
    return new Promise((resolve, reject) => {
        try {
            db.user.updateOne({_id:userId},{
                $set:{
                    status:true,
                }               
            }).then(()=>{
                resolve()
            })           
        } catch (error) {
            console.log(error);
        }
    })
  }
  ,
  totalUserCount:()=>{
    return new Promise(async(resolve,reject)=>{
      try{
        let response=await db.order.aggregate([
          {
            $unwind:"$orders"
          },
          {
            $match:{
              "orders.orderStatus":"Delivered"
            }
          }
        ])
        resolve(response)
      }
      catch(error){
        console.log(error)

      }
    })
  },

  changePassword:async(userId,data)=>{
   return new Promise(async(resolve,reject)=>{
await db.user.updateOne({_id:userId},
  {
    $set:{
      username:data,
      email:data,
      phoneNumber:data,
      
    }
  }  
  ).then(data=>{
    console.log("iiiii",data,"uuuu")
    resolve(data)
  })
   })
                        
                
    db.user.updateOne({_id:userId},{
      $set:{
        password
      }
    })
  },
  productSearch:(searchData)=>{
    let keyword=searchData.search
    console.log(keyword)
    return new Promise(async(resolve,reject)=>{
      try{
        const products=await db.products.find({name:{$regex: new RegExp(keyword,'i')}});
        if(products.length>0){
          console.log(products,"DOOM");
          resolve(products)
        }else{
          reject('no products found')
        }
      }
      catch(error){
        console.log(error)
      }
    })
  },

  
  postSort:(sortOption)=>{
    return new Promise(async(resolve,reject)=>{
      let products;
      if(sortOption==='price-low-to-high'){
        products=await db.products.find().sort({price:1}).exec();
      }
      else if(sortOption==='price-high-to-low'){
        products=await db.products.find().sort({price:-1}).exec();
      }
      else{
        products=await db.products.find().exec()
      }
      resolve(products)
    })
  },  documentCount:()=>{
    return new Promise(async(resolve,reject)=>{
      await db.products.find().countDocuments().then((documents)=>
      resolve(documents))
    })

  },

}