const db = require("../model/connection");

const userHelpers = require("../helpers/userHelpers");
const productHelpers = require("../helpers/productHelpers");
const cartHelpers = require("../helpers/cartHelpers");
const categoryHelpers = require("../helpers/categoryHelpers");
const { body, validationResult } = require("express-validator");
const slugify = require("slugify");
var colors = require('colors');


module.exports={


  getProductPage: async (req, res) => {
    try {
      //cartCOunt is lagging to get it from database
      let user = req.session.user;
      let proId = req.params.id;
      let cartCount = await cartHelpers.getCartCount(user);

     

      productHelpers.getProduct(proId).then((product) => {
       
        res.render("user/view-product", { product, user, cartCount });
      });
    } catch (error) {
      console.log(error);
    }
  },
  filterProduct: async (req, res) => {
    let catName = req.params.id;
    let user = req?.session?.user;
   
    
    let cartCount = await cartHelpers?.getCartCount(user);
    let category = await productHelpers.getAllProducts();
   
    productHelpers.filterCategory(catName).then((filterproducts) => {
     
      res.render("user/filter", { user, filterproducts, cartCount, category });
    });
  }, 
  sortProducts:async (req,res)=>{
    let user = req?.session?.user;

    let cartCount = await cartHelpers?.getCartCount(user);

    let category = await productHelpers.getAllcategory();

    let sortOption=req.body['selectedValue']
   
    let viewCategory=await categoryHelpers.viewAddCategory()
    userHelpers.postSort(sortOption).then(response=>{
      if(response){
        res.render("user/shop-search",{response,viewCategory,user,category,cartCount})
      }
    })
  },
  getSearch:async(req,res)=>{
    let user = req?.session?.user;

    let cartCount = await cartHelpers?.getCartCount(user);

    let category = await productHelpers.getAllcategory();

   
  const isUser=req.session.user
    let viewCategory=await categoryHelpers.viewAddCategory()
   
    userHelpers.productSearch(req.body).then(response=>{
      if(response){
        res.render('user/shop-search',{
          viewCategory,response,user,category,cartCount
        })
      }
    }).catch(err=>{
      console.log(err)
    })
  },
  
}