var express = require('express');
var monk = require('monk');
var router = express.Router();
var db = monk('localhost:27017/cellphonekiosk');

router.get('/', async function(req,res,next){
    if(!req.session.user){
      res.redirect('/login');
      return;
    }
    let collection = db.get('users');
    let products = db.get('products');
    let user = await collection.findOne({username: req.session.user});
    let imageList = [];
    for(item of user.cart.list){
        let product = await products.findOne({_id: item.productID});
        imageList.push(product.cover);
    }
    if(req.query.error)
    {
      res.render('cart',{title: "Cart",username: req.session.user, cart: user.cart, error: req.query.error, isAdmin: req.session.isAdmin, images: imageList});
      return;
    }
    res.render('cart',{title: "Cart",username: req.session.user, cart: user.cart, isAdmin: req.session.isAdmin, images: imageList});
    
  });


// GIVEN id: <product-id> quantity: <product-quantity>
router.post('/', function(req,res,next){
    if(!req.session.user)
    {
        res.send(403);
        return;
    }
    let collection = db.get('users');
    let products = db.get('products');
    collection.findOne({username: req.session.user}, function(err,user){
        products.findOne({_id: req.body.id}, function(err,product){
            if(user.cart.list.findIndex(obj => obj.productID == req.body.id) > -1)
            {
                user.cart.list[user.cart.list.findIndex(obj => obj.productID == req.body.id)].quantity+= parseInt(req.body.quantity);
                

            }
            else{
                user.cart.list.push({
                    productID: product._id,
                    quantity: parseInt(req.body.quantity),
                    price: product.price,
                    name: product.title
                });

            }

            user.cart.total += parseInt(req.body.quantity) * product.price;
            
            collection.findOneAndUpdate({username: req.session.user}, {$set: {cart: user.cart}});
            res.redirect('/cart')
            

        })

    })
})


//req.body.id given
router.get('/edit', function(req,res,next){
    if(!req.session.user){
        res.redirect('/login');
        return;
      }
    let collection = db.get('users');
    let products = db.get('products');
    collection.findOne({username: req.session.user}, function(err,user){
        products.findOne({_id: req.query.id}, function(err,product){
            item = user.cart.list[user.cart.list.findIndex(obj => obj.productID == req.query.id)]
            res.render('editCart', {title: "Edit Cart", username: req.session.user,  quantity:item.quantity, id: product._id, stockQuantity: product.quantity, name: item.name, cover: product.cover, isAdmin: req.session.isAdmin});
        });
        
    })
    
});
  // /cart/edit?id=<product._id>

  //res.body.id & res.body.quantity given
router.put('/', function(req,res,next){
    if(!req.session.user){
        res.send(403);
        return;
    }
    let collection = db.get('users');
    collection.findOne({username: req.session.user}, function(err,user){
        // req.quantity
        if(parseInt(req.body.quantity) <= 0)
        {
            res.send(400);
            return;
        }
        user.cart.total += (parseInt(req.body.quantity) - user.cart.list[user.cart.list.findIndex(obj => obj.productID == req.body.id)].quantity) * user.cart.list[user.cart.list.findIndex(obj => obj.productID == req.body.id)].price
        user.cart.list[user.cart.list.findIndex(obj => obj.productID == req.body.id)].quantity = parseInt(req.body.quantity);
        
        collection.findOneAndUpdate({username: req.session.user}, {$set: {cart: user.cart}});
        res.redirect('/cart');
    })

});

//req.body.id
router.delete('/', function(req, res, next){
    if(!req.session.user){
        res.send(403);
        return;
    }
    let collection = db.get('users');
    collection.findOne({username: req.session.user}, function(err,user){
        let deleteIndex = user.cart.list.findIndex(obj => obj.productID == req.body.id);
        user.cart.total = user.cart.total - (user.cart.list[deleteIndex].quantity * user.cart.list[deleteIndex].price);
        user.cart.list.splice(user.cart.list.findIndex(obj => obj.productID == req.body.id),1);
        collection.findOneAndUpdate({username: req.session.user}, {$set: {cart: user.cart}});
        res.redirect('/cart');
    })
    
});
module.exports = router;