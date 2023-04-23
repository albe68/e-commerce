// const {response}=require("express");
const db=require("../model/connection")
// const {category}=require("../model/connection")

module.exports={
    viewAddCategory:()=>{
        return new Promise(async(resolve,reject)=>{
            await db.category.find().exec().then(response=>{
                resolve(response)
            })
        }) 
    }
}