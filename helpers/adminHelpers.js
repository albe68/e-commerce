const db= require("../model/connection")

module.exports={
    doAdminLogin:(adminData)=>{
        console.log(adminData)
        return new Promise(async(resolve,reject)=>{
        try{
            let admin=await db.admin.findOne({email:adminData.email});
        let response={};
        if(admin){
            console.log("yessss")
            response.admin=admin;
            response.status=true;
            resolve(response);
        }else{
            console.log("kikikikikii")
            resolve(response)
        }}
        catch(error){
            console.log("error")
            console.log(error);

        }
        });
    },
};