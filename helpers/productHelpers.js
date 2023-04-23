// const { response } = require("express");
// const { tryParse } = require("objectid");
const db = require("../model/connection");
//IMAGE UPLOAD
const { products, category } = require("../model/connection");

// var fs = require("fs");
// var path = require("path");
// var express = require("express");
// var app = express();
// var bodyParser = require("body-parser");
// var mongoose = require("mongoose");

module.exports = {
  // Get All Product

  getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let page_index=1;
        
        let products = await db.products.find({});
        // console.log(products)
        resolve(products);
      } catch (error) {
        console.log(error);
      }
    });
  },

  getProduct: (proId) => {
    return new Promise((resolve, reject) => {
      try {
        db.products.find({ _id: proId }).then((products) => {
          console.log(products);
          resolve(products);
        });
      } catch (error) {
        console.log(error);
      }
    });
  },

  // Add Product

  addProduct: (products,filename) => {
    return new Promise(async (resolve, reject) => {
      try {
        ImageUpload=new db.products({
          name:products.name,
          description:products.description,
          quantity:products.quantity,
          Image:filename,
          category:products.category,
          price:products.price
          
        })
        ImageUpload.save().then(data=>{
          resolve(data)
        })
        
      } catch (error) {
        console.log(error);
      }
    });
  },

  postAddProduct: (product) => {
    return new Promise((resolve, reject) => {
      console.log(filename);
      db.products.create(
        {
          name: userData.name,
          description: userData.description,
          price: userData.price,
        },
        (err, data) => {
          if (err) {
            console.log("errorrrrrrr", err);
          } else {
            resolve(data);
          }
        }
      );
    });
  },

  // Update Product

  updateProduct: (proId, body,image) => {
    return new Promise(async(resolve, reject) => {
      try {
        console.log("THISSSSSSSSSSSSS", body);
       await db.products
          .updateOne(
            { _id: proId },
            {
              $set: {
                name: body.name,
                description: body.description,
                quantity:body.quantity,
                price: body.price,
                category: body.category,
                Image: image
                
              },
            }
          )
          .then((response) => {
            resolve(response);
          }).catch(err=>{console.log(err); reject(err)});
      } catch (error) {
        console.log(error);
      }
    });
  },

  deleteProduct: (proId) => {
    console.log("in helper:", proId);
    return new Promise(async (resolve, reject) => {
      try {
        await db.products.updateOne({ _id: proId },{
          $set:[
            {
              
            }
          ]
        });
        // console.log(_id)
        resolve();
      } catch (error) {
        console.log(error);
      }
    });
  },

  unlistProduct: (proId) => {
    return new Promise((resolve, reject) => {
      try {
        db.products
          .updateOne(
            { _id: proId },
            {
              $set: {
                status: false,
              },
            }
          )
          .then(() => {
            resolve();
          });
      } catch (error) {
        console.log("ERROR IN UNlist PRODUCT", error);
      }
    });
  },
  listProduct: (proId) => {
    try {
      return new Promise((resolve, reject) => {
        db.products.updateOne(
          { _id: proId },
          {
            $set: {
              status: true,
            },
          }
        )
        .then(()=>{
          resolve();
        });
      });
    } catch (error) {
      console.log("ERROR IN LIST PRODUCT", error);
    }
  },
  //CATEGORY

  // Add Category

  addCategory: (categories) => {
    return new Promise((resolve, reject) => {
      console.log("1234567",categories)
      db.category
        .find({
          category: categories.category,
        })
        .then(async (response) => {
          console.log(response);
          if (response.length == 0) {
            try {
              
              await db.category(categories).save();
              resolve();
            } catch (error) {
              console.log(error);
            }
          } else {
            let response = false;
            resolve(response);
          }
        });
    });
  },
  // Get All Category

  getAllcategory: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let categories = await db.category.find({});
        resolve(categories);
      } catch (error) {
        console.log(error);
      }
    });
  },
  deleteCategory: (cateId) => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log(cateId);
        await db.category.deleteOne({ _id: cateId });
        resolve();
      } catch (error) {
        console.log("hiiiii");

        console.log(error);
      }
    });
  },

  //NO ASYNC AWAIT
  getCategory: (cateId) => {
    return new Promise(async (resolve, reject) => {
      try {
        await db.category.find({ _id: cateId }).then((category) => {
          resolve(category);
        });
      } catch (error) {
        console.log(error);
        reject({ error: "Unauthorized Action" });
      }
    });
  },
  updateCategory: (cate, cateId) => {
    return new Promise(async (resolve, reject) => {
      try {
        await db.category.updateOne(
          { _id: cateId },
          {
            $set: {
              category: cate.category,
            },
          }
        );
        resolve();
      } catch {}
    });
  },

  //USERS
  getAllUsers: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let user = await db.user.find({});
        resolve(user);
      } catch (error) {
        console.log(error);
      }
    });
  },
  blockUsers:  (userId) => {
    const response =  new Promise(async(resolve, reject) => {
      try {
        let data = db.user(user);

        db.user.updateOne(
          { _id: userId },
          {
            $set: {
              isBlocked: true,
            },
          }
        );
      } catch (error) {
        console.log(error);
      }
    });
    resolve(response);
  },
  filterCategory: (catName) => {
   return new Promise (async(resolve,reject)=>{
    
     let cat=await db.products.find({category:catName})
    //  console.log(cat,"jskajalskjalksjsa")
      resolve(cat)
      
    })
    
  },
  shopListProducts:(pageNum)=>{
    let perPage=6;
    return new Promise(async(resolve,reject)=>{
      await db.products.find().skip((pageNum-1)*perPage).limit(perPage).then((response)=>{
        resolve(response)
      })
    })
  },
  wishListProducts:(proId)=>{
    return new Promise((async(resolve,reject)=>{
      db.products.find({_id:proId}).then(async(response)=>{
        try{
          console.log(response,"uuid")
          await db.wishlist(response).save()
        }
        catch{
          
        }
      
      })
      


    }))
  }
  ,
  addToWishlist:(products)=>{
    try{
      return new Promise(async(resolve,reject)=>{
        
        let wishProducts=db.wishlist(products).save()
        // data.save(wishProducts)
      })
    }
    catch{

    }
  }

};
