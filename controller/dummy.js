home:async (req, res,next) => { 
    // // app.get('/:id', function (req, res) {
    //     console.log(req.params['id']);
    //     res.send();
    //   // });
    let user = req?.session?.user;
    console.log("mone", user);
    let cartCount= await cartHelpers?.getCartCount(user)
    //CHANGED THE STRUCTURE OF THIS CODE NORMAL RENDER VS PRODUCTS COMING
    productHelpers.getAllProducts().then((product)=>{
      console.log(cartCount,"cartCount")
      res.render("user/user", { 
        user,
        cartCount
       });
    })
    .catch((err)=>{
      console.log(err,"ERROR")
    })
  }