var express = require('express');
var monk = require('monk');
var router = express.Router();
var db = monk('localhost:27017/cellphonekiosk');

router.post('/', async function(req,res,next){
    if(!req.session.user){
      res.redirect('/login');
    }
    let collection = db.get('users');
    let products = db.get('products');
    let user = await collection.findOne({username: req.session.user});
    let approvedItems = [];
    for(item of user.cart.list){
        let product = await products.findOne({_id: item.productID});
        if(product.quantity-item.quantity >= 0 && !product["soft-delete"])
            approvedItems.push(item);
        else{
            if(product["soft-delete"])
            {
                let removeIndex = user.cart.list.findIndex(obj => obj.productID.equals(product._id));
                user.cart.total = user.cart.total - (user.cart.list[removeIndex].price * user.cart.list[removeIndex].quantity);
                user.cart.list.splice(removeIndex,1);
                await collection.findOneAndUpdate({username: req.session.user},{$set: {cart: user.cart}});
                res.redirect("/cart?error=item-deleted");
                return;
            }
            res.redirect("/cart?error=out-of-stock");
            return;
        }
    }
    for(approvedItem of approvedItems){
        let product = await products.findOne({_id: item.productID});
        await products.findOneAndUpdate({_id: item.productID},{$set: {quantity: product.quantity-item.quantity}});
    }
    let temp = new Date(Date.now());
    const month = temp.toLocaleString('default', { month: 'long' });
    user.cart.purchaseTime = `${month} ${temp.getDate()}, ${temp.getFullYear()} at ${temp.toLocaleTimeString()}`
    user.purchaseHistory.unshift(user.cart);
    collection.findOneAndUpdate({username: req.session.user}, {$set: {purchaseHistory: user.purchaseHistory, cart: {list: [], total: 0.0}}});
    res.redirect(`/thanks?username=${req.session.user}`);

      });


  module.exports = router;