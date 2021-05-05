var express = require('express');
var monk = require('monk');
var crypto = require('crypto');
var router = express.Router();
var db = monk('localhost:27017/cellphonekiosk');

router.get('/addItem', function(req,res,next){
    if(!req.session.isAdmin){
        res.send(403);
        return;
    }
    console.log(req.session.isAdmin);
    res.render('addItem', {title: "Add Item", username: req.session.user, isAdmin: req.session.isAdmin});

});

router.get('/updateItem', async function(req,res,next){
    if(!req.session.isAdmin || !req.query.id){
        res.send(403);
        return;
    }
    let products = db.get('products');
    let product = await products.findOne({_id: req.query.id});
    res.render('updateItem', {title: "Update Item", username: req.session.user, product: product, isAdmin: req.session.isAdmin});    
});

module.exports = router;