

module.exports={
verifyLogin:async(req,res,next)=>{
   
    console.log("USER VERIFIED")
    if(req.session.user)
{
    next()
    
}
else{
    console.log("Login with user")
    res.render("user/login")
}
},
verifyAdmin:(req,res,next)=>{
    if(req.session.admin){
        next()
    }
    else{
       
        res.render("admin/login",{layout:"adminLayout"})
    }
},
userValidation:(req,res,next)=>{
    
    body("username").custom(value => {
        return user.find({
            username: value
        }).then(user => {
            if (user.length > 0) {
                // Custom error message and reject
                // the promise
                return Promise.reject('Username already in use');
            }
        });
    }),
    (req, res) => {
        // Validate incoming input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }
        
    }
}

}
