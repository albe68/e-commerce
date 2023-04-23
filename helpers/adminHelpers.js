const db= require("../model/connection")
const {order}=require("../model/connection")

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

    salesReport:()=>{
        return new Promise (async(resolve,reject)=>{
         const sales= await db.order.aggregate([
            {
                $unwind:"$orders"
                
            },{
                $match:{
                    'orders.orderStatus':'Delivered'
                }
            }
         ])
         
         
        
            resolve(sales)
         
        })
        

    },
    getSalesRepTotalAmount: ()=>{
        return new Promise(async (resolve, reject) => {
            console.log("hi")
            await db.order.aggregate([
                {
                    $unwind: '$orders'
                }, {
                    $match: { 'orders.orderStatus': 'Delivered' }
                },
                {
                    $project: {
                        productDetails: '$orders.productDetails'
                    }
                },
                {
                    $unwind: '$productDetails'
                },
          
                {
                    $project: {
                        price: '$productDetails.productPrice',
                        quantity: '$productDetails.quantity'
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ["$price", "$quantity"] } }
                    }
                }
            ]).then((total)=>{

           
                resolve(total[0]?.total);

            })
           
        });
     
    },
    getTotalAmount:(date)=>{
        let start=new Date(date.startdate)
        let end=new Date(date.enddate)
        console.log(start,end)
        return new Promise(async(resolve,reject)=>{
            await db.order.aggregate([
                {  $unwind:'$orders'
                },
                {
                    $match:{
                        $and:[
                            {
                                "orders.orderStatus":'Delivered'
                            },
                            {
                                "orders.createdAt":{ $gte: start, $lte: end}
                            }
                        ]
                    }
                },
                       
]).then((total)=>{
    console.log("total it is",total,"total it is")
    resolve(total[0]?.total)
})
        })
    },
    postReport:(date)=>{
        let start=new Date(date.startdate);
        let end=new Date(date.enddate);
            
            return new Promise(async(resolve,reject)=>{
                await db.order.aggregate([
                    {
                        $unwind:"$orders",
                    },
                    {
                        $match:{
                            $and:[
                                {
                                    "orders.orderStatus":"Delivered"
                                },
                                {
                                    "orders.createdAt":{
                                        $gte:start,$lte:end
                                    }
                                }
                            ]
                        }
                    }
                ])  .exec()
                .then(response=>{
                    console.log(response,"this is reponse in line 141 adminHelpers");
                    resolve(response)
                })
            })
          

    }
};