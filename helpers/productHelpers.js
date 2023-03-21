const { response } = require("express");
// const { tryParse } = require("objectid");
const db=require("../model/connection")
//IMAGE UPLOAD
const { products, category } = require("../model/connection");

var fs = require('fs');
var path = require('path');
var express = require('express')
var app = express()
var bodyParser = require('body-parser');
var mongoose = require('mongoose')
 

module.exports = {
  // Get All Product

   getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
  try{ 
    let products=await db.products.find({});
    console.log(products)
      resolve(products)
      // console.log(products)
    }catch(error){
      console.log(error)
    }});
  },

  getProduct: (proId) => {

    return new Promise((resolve, reject) => {
      try {
        db.products.find({_id:proId}).then((products) => {
          console.log(products)
          resolve(products);
        });
      } catch (error) {
        console.log(error);
      }
    });
  },
  
   // Add Product

   addProduct: (products) => {
    
    return new Promise(async(resolve, reject) => {
      try {
        
        
        let data = await db.products(products);
      
        data.save();
        resolve(data._id);
        console.log("data",data._id);
        

      } catch (error) {
        console.log(error);
      }
    });
  },
  
  postAddProduct: (userData,filename)=>{
    return new Promise((resolve,reject)=>{
      
        uploadedImage= new db.products({
            name:userData.name,
            description:userData.description,
            price:userData.price,
            image:filename,
            
        })
        uploadedImage.save().then((data)=>{
            resolve(data)
        })
    })
},

    // Update Product

  updateProduct: (proId, body) => {
    return new Promise( (resolve, reject) => {
      try {
        console.log("THISSSSSSSSSSSSS",body)
        db.products.updateOne(
          {_id:proId},
          {
            $set: {
              name: body.name,
              description: body.description,
              price: body.price,
              category: body.category,
              
              
            },
          }
        ).then(()=>{
          resolve();
        })
        
      } catch (error) {
        console.log(error);
      }
    });
  },
  
 
  deleteProduct:(proId)=>{
    console.log("in helper:",proId)
    return new Promise (async(resolve,reject)=>{
      try{
        await db.products.deleteOne({_id:proId});
        // console.log(_id)
        resolve();
      }
      catch(error){
        console.log(error)      }
    })
  },
  //CATEGORY

   // Add Category

   addCategory: (categories) => {
    return new Promise((resolve, reject) => {
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
    return new Promise(async(resolve, reject) => {
      try {
        console.log("hiiiii")
         await db.category.deleteOne({_id:cateId});
        resolve();
      } catch (error) {
        console.log("hiiiii")

        console.log(error);
      }
    });
  },
  
  //NO ASYNC AWAIT
  getCategory: (cateId) => {
    return new Promise(async (resolve, reject) => {
      try {
        await db.category.find({_id:cateId}).then((category)=>{
        resolve(category);
        });
      } catch (error) {
        console.log(error);
        reject({ error: "Unauthorized Action" });
      }
    });
  },
  updateCategory:(cate,cateId)=>{
    return new Promise(async(resolve,reject)=>{
     try{
     await db.category.updateOne(
        {_id:cateId},
        {$set:{
          category:cate.category
        }}
      )
      resolve();
       
       
     
     }
     catch{

     }
    })
  },

  //USERS
  getAllUsers:()=>{
    return new Promise (async(resolve,reject)=>{
      try{
       let user= await db.user.find({});
        resolve(user)
      }catch(error){
        console.log(error);
      }
    })
  },
  blockUsers:async(userId)=>{
    const response=await new Promise((resolve,reject)=>{
      try {
        let data =  db.user(user);
      
         db.user.updateOne({_id:userId},
          {
            $set:{
            isBlocked:true
            }
          })

      } catch (error) {
        console.log(error);
      }

    })
    resolve(response)
  }
}

