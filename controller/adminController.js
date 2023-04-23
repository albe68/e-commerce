// const db=require("../model/connection")
// const { admin, category,products, user,order } = require("../model/connection");  //changed Model to model
// const session=require('express-session')
// const {response}=require("../app")
// const mongoose = require("mongoose");
// var fs = require('fs');
// var path = require('path');
// var express = require('express')
// var app = express()
// var bodyParser = require('body-parser');
// const auth=require("../controller/auth")
const productHelpers = require("../helpers/productHelpers")
const userHelpers=require("../helpers/userHelpers")
const adminHelpers = require("../helpers/adminHelpers");
const orderHelpers = require("../helpers/orderHelpers");
var XLSX = require('xlsx');




//add product with multer
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + file.originalname
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
})
const upload = multer({ storage: storage })
const add_image = upload.array('image', 12)


module.exports={

  
  getAdminPanel:async(req,res)=>{
    let variable=req.session.adminIn;
    
    let totalProducts,days=[]
    let ordersPerDay={};
    let paymentCount=[]

    await productHelpers.getAllProducts().then((Products)=>{
      console.log(Products,"adminControl @ 45")
      totalProducts=Products.length
    })

    let orderByCod=await orderHelpers.getCodCount()

   
    let codCount = orderByCod.length

    let orderByRZPAY = await orderHelpers.razorPayCount()
    let rzPAYCount=orderByRZPAY.length
    let totalOrder=rzPAYCount+codCount
    console.log(orderByRZPAY,rzPAYCount,"RAZOR")
    
    let totalUser = await userHelpers.totalUserCount()

    paymentCount.push(codCount)
    paymentCount.push(rzPAYCount)

    await orderHelpers.getOrderByDate().then((response)=>{
      console.log(response,"this is response")
      if(response.length>0){
        let result=response[0]?.orders
        for(let i=0;i<result.length;i++){
          let ans={}
          ans['createdAt']=result[i].createdAt
          days.push(ans)
          console.log("hola",ans,"hola")
          ans={}
        }
      }

      days.forEach((order)=>{
        console.log(order,"iop")
        const day=order.createdAt.toLocaleDateString('en-US',{weekday:'long'})
        ordersPerDay[day]=(ordersPerDay[day]||0)+1;
        console.log(day,"ACTDAY")
      })
    })
      await orderHelpers.getAllOrders().then(response=>{

        console.log(response);
        let length=response.length
        let total=0;

        for(let i=0;i<length;i++){
          total += response[i].price
        }
        res.render("admin/admin-dashboard",{
          layout:"adminLayout",variable,length,total,totalProducts,ordersPerDay,paymentCount,totalUser,rzPAYCount,codCount,totalOrder  
        })
      })
      
  


  }
  ,
    getAdminLogin:(req,res)=>{
         try
        { if(req.session.adminIn)
          {
            console.log(req.session.adminIn,"222222222222222222")
     res.render("admin/admin-dashboard",{layout:"adminLayout"})
    }
          else{
            console.log(req.session.adminIn,"11111111111111111111111111111111111")
            res.render("admin/login",{layout:"adminLayout"}) 
          }
        }
         catch(error){
          console.log(error);

         }

    },
    postAdminlogin:(req,res)=>{
        // console.log("hello",adminData)
      try{ 
        adminHelpers.doAdminLogin(req.body)
        .then((response)=>{
          if(response.status){
            console.log(response.status)
            console.log(response.admin._id,"kill")
            req.session.admin=response.admin._id;
            req.session.adminIn=true;
            console.log(req.session.adminIn)
            res.redirect("/admin")
          }
          else{
            res.redirect("/admin/login")
          }
        })
          .catch((err)=>console.log("QWERTYUIYTREW"))
        }
        catch(error){
          console.log("ERROORRORRR")
          console.log(error)
        }
    },
    getAdminLogout:(req,res)=>{
      try{
        req.session.admin=null;
        req.session.adminIn=false;
        res.clearCookie();
        console.log("LOGGED OUT")
        res.redirect("/admin/login");
        console.log(req.session.adminIn)
      }
      catch(error){
        console.log(error)
      }
      
    },
    /*HOME PAGE*/
    indexPage:(req,res)=>{
      res.render("admin/admin-dashboard",{layout:"adminLayout"})
    },
  /*PRODUCTS PAGE*/
  Products:(req,res)=>{
    productHelpers.getAllProducts().then((products)=>{
    console.log("these are :",products)
    res.render("admin/products", {products,layout: "adminLayout"})
    })
 
  },
//ADD PRODUCTS
getAddProducts: async(req, res) => {
    await productHelpers.getAllcategory().then((category)=>{
      console.log("jksajsklajsklajkasjkaljs",category,"asjkajkskajskajsklajska")

      productHelpers.getAllProducts()
      .then((products) => {
        
        res.render("admin/add-product", {
          layout: "adminLayout",products,category})
          
        });


     })
     
      // console.log("jasajkshjashajkhsakjshajkshakjshkas",category)
       
        
      },

    

postAddProduct: async (req, res) => { console.log(req.files);
  console.log(req.files);
  console.log(req.file);
console.log("ahjkshajskahjshajskahsjkahkjsaasasawqwqwqwq",req.body)
const image=req.files.map(files=>(files.filename))
console.log("TAKE IT ",image,"admin Cont 210")
  try{
    productHelpers.addProduct(req.body,image).then((insertedId)=>{
      console.log("product added");
      res.redirect('/admin/add-product')
    })
  }
  catch(error){
    console.log(error)
  }
  },

  Products:(req,res)=>{
    productHelpers.getAllProducts().then((products)=>{
    console.log("these are :",products)
    res.render("admin/products", {products,layout: "adminLayout"})
    })
 
  },

  getEditProducts:async(req,res)=>{
   let proId = req.params.id;
   console.log("get:",proId)
   const category=await productHelpers.getAllcategory()
   console.log("opo",category,"opo")
  productHelpers.getProduct(proId).then((products) => {
        res.render("admin/edit-product", {
          products,
          layout: "adminLayout", category
         });
      })
      .catch((err) =>
         console.log(err));
      

      
  },
  
  postEditProducts: (req, res) => {
    let proId = req.params.id;
    let body = req.body;
    console.log(proId,"BODYYYYYYYYYYYY",body,req.body)

    const images = []
    if (!req.files.image1) {
      let image1 = req.body.image1
      req.files.image1 = [{
        fieldname: 'image1',
        originalname: req.body.image1,
        encoding: '7bit',
        mimetype: 'image/jpeg',
        destination: 'public/uploads',
        filename: req.body.image1,
        path: ` public\\uploads\\${image1}`,
      }]
    }
    if (!req.files.image2) {
      let image2 = req.body.image2
      req.files.image2 = [{
        fieldname: 'image2',
        originalname: req.body.image2,
        encoding: '7bit',
        mimetype: 'image/jpeg',
        destination: 'public/uploads',
        filename: req.body.image2,
        path: `public\\uploads\\${image2}`,
      }]
    }
    if (!req.files.image3) {
      let image3 = req.body.image3
      req.files.image3 = [{
        fieldname: 'image3',
        originalname: req.body.image3,
        encoding: '7bit',
        mimetype: 'image/jpeg',
        destination: 'public/uploads',
        filename: req.body.image3,
        path: `public\\uploads\\${image3}`,
      }]
    }
    if (!req.files.image4) {

      let image4 = req.body.image4
      req.files.image4 = [{
        fieldname: 'image4',
        originalname: req.body.image4,
        encoding: '7bit',
        mimetype: 'image/jpeg',
        destination: 'public/uploads',
        filename: req.body.image4,
        path: `public\\uploads\\${image4}`,
      }]

    }
    if (req.files) {
      Object.keys(req?.files).forEach((key) => {
        if (Array.isArray(req?.files[key])) {
          req?.files[key]?.forEach((file) => {
            images.push(file.filename);
          });
        } else {
          images.push(req?.files[key]?.filename);
        }
      });
    }

    productHelpers
    .updateProduct(req.params.id, req.body, images)
    .then((response) => {
      res.redirect("/admin/products");
    })
    .catch((err) => {
      res.status(500).send('Internal server error');
    });

  },
  

  
  
  getdeleteProducts:(req,res)=>{
    try{console.log("THIS IS params",req.params.id)
    let proId=req.params.id;
    console.log('params',proId)
    productHelpers.unlistProduct(proId)
    
    .then(() => {
      
      console.log("hiiiii")
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));}
    catch(error){
      
      console.log(error)

    }
  },
  getListProducts:(req,res)=>{
    console.log("line")
    let proId=req.params.id
    console.log("POD",proId)
    try{
      productHelpers.listProduct(proId).then(()=>{
        res.redirect("/admin/products")
      })
    }
    catch(error){
      console.log(error)
    }
  }
,
  //CATEGORY MANAGEMENT

 // Get Category

 getCategory: (req, res) => {
  try {
    productHelpers
      .getAllcategory()
      .then((category) => {
        res.render("admin/add-category", {
          layout: "adminLayout",
          category,
        });
        
      })
      .catch((err) => {
        res.render("user/500Page");
        console.log(err);
      });
  } catch (error) {
    res.render("user/500Page");
  }
},
    
    // Add Category

  addCategory: (req, res) => {
    try {
      
      productHelpers
        .addCategory(req.body).then((response) => {
          
          if (response == false) {
            console.log("CATEGORY ALREADY EXSISTS")
            res.send({ value: "error" });
            
            res.redirect("/admin/category")
          } 
          else {
            res.send({ value: "good" });
            console.log("responseeeeeeeeeeeeeeeeeeeeeee",response)
            res.redirect("/admin/category")
          }
        })
        .catch((err) => {
          console.log("ERROR")
        });
    } 
    catch (error) {
      console.log(error)
    }
  },

  deleteCategory: (req, res) => {
    try{
      console.log("HEYY")
    let cateId = req.params.id;
    console.log(cateId)
    productHelpers.deleteCategory(cateId)
      .then(() => {
        console.log("hiiiii")

        res.redirect("/admin/category");
      })
      .catch((err) => console.log("ERROR"));
    }catch(error){
      console.log(error)
    }
  },
  ud:(req,res)=>{
console.log(req.params.id)  }
  ,
  
  // Edit Category

  editCategory: (req, res) => {
    try {
      
      var catId =req.params.id;
      productHelpers
        .getCategory(catId)
        .then((category) => {
          res.render("admin/edit-category", {
            layout: "adminLayout",category
            
          });
        })
        .catch((err) => {
          res.render("user/500Page");
          console.log(err);
        });
    } 
    catch (error) {
      res.render("user/500Page");
    }

    
  },

     // Update Category

  updateCategory: (req, res) => {
    let cate = req.body;
    let cateId = req.params.id;
    console.log("HELOOOOOOOOOOOOOOOO",cate,cateId)
    productHelpers
      .updateCategory(cate, cateId)
      .then(() => {
        res.redirect("/admin/category");
      })
      .catch((err) => console.log(err));
  },
  




  Users:(req,res)=>{
    
    productHelpers.getAllUsers().then((user)=>{
      console.log(user)
      res.render('admin/users',{user,layout:"adminLayout"})
    })
    
  },

  blockUser: (req, res) => {
    let userId = req.params.id;
    
    userHelpers
      .blockUser(userId)
      .then(() => {

       
        res.redirect("/admin/users");
      })
      .catch((err) => console.log(err));
  },
  

  // Unblock Users

  unblockUser: (req, res) => {
    let userId = req.params.id;
    userHelpers
      .unblockUser(userId)
      .then(() => {
        
        res.redirect("/admin/users");
      })
      .catch((err) => console.log(err));
  },
  getAdminOrders:(req,res)=>{
    
   try{
   
    orderHelpers.getAdminOrders()
    .then((data)=>{
      // console.log("WORKING",data)
      
      res.render("admin/orders",{layout:"adminLayout",data})

    })}
    catch(error){
      console.log("errrorr")
    }
    
  },
  updateOrder:(req,res)=>{
    try{
      orderHelpers.updateOrder(req.body).then((response)=>{
        res.json(response);
      }).catch((err)=>{
        console.log(err)
      })
    }
    catch(error){
      console.log(error)
    }
  },
  getSalesReport:async(req,res)=>{
    try{
      getDate=(date)=>{
        let orderDate = new Date(date);
        let day = orderDate.getDate();
        let month = orderDate.getMonth() + 1;
        let year = orderDate.getFullYear();
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();
        return `${isNaN(day) ? "00" : day}-${isNaN(month) ? "00" : month}-${isNaN(year) ? "0000" : year
        } ${date.getHours(hours)}:${date.getMinutes(minutes)}:${date.getSeconds(seconds)}`;
      }
      
     const total= await adminHelpers.getSalesRepTotalAmount()
     const report=await adminHelpers.salesReport()
     let Details=[]
report.forEach(orders=>{Details.push(orders.orders)})
console.log("loiuse",Details,"loise")
   res.render('admin/salesReport',{layout:'adminLayout',Details,getDate,total})
   
     
    }
    catch(error){
      console.log(error)
    }
  },
  postSalesReport:async(req,res)=>{
  try{  getDate=(date)=>{
      let orderDate = new Date(date);
      let day = orderDate.getDate();
      let month = orderDate.getMonth() + 1;
      let year = orderDate.getFullYear();
      let hours = date.getHours();
      let minutes = date.getMinutes();
      let seconds = date.getSeconds();
      return `${isNaN(day) ? "00" : day}-${isNaN(month) ? "00" : month}-${isNaN(year) ? "0000" : year
      } ${date.getHours(hours)}:${date.getMinutes(minutes)}:${date.getSeconds(seconds)}`;
    }
    let Details=[];
    console.log("hiiiiiiii",req.body)
    let total=await adminHelpers.getTotalAmount(req.body)
    adminHelpers.postReport(req.body).then((orderData)=>{
      orderData.forEach(orders=>{Details.push(orders.orders)})
      res.render('admin/salesReport',{layout:'adminLayout',Details,getDate,total})
    })
  }catch(error){
    console.log(error)
  }
    
    

  }
    } 

   
    
    

