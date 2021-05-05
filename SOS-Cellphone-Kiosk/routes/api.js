var express = require('express');
var monk = require('monk');
var router = express.Router();
var db = monk('localhost:27017/cellphonekiosk');
var multer = require('multer');
var storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null, 'public/images/');
    },
    filename: function(req,file,cb){
        cb(null, file.originalname);
    }
});
var upload = multer({ storage: storage});

router.post('/exists', function(req,res,next){
    let collection = db.get('users');
    collection.findOne({username: req.body.username}, function(err,user){
        if(err) throw err;
        if(!user){
            res.send(200, {result: false});
            return;
        }
        res.send(200, {result: true});
    })
});

router.post('/product', upload.fields([{name: 'coverImg'}, {name: 'boxImg'}]), async function(req,res,next){
    if(!req.session.isAdmin)
    {
        res.send(403);
        return;
    }
    let products = db.get('products');
    await products.insert({
        title: req.body.title,
        category: req.body.category,
        brand: req.body.brand,
        cover: req.files.coverImg[0].originalname,
        box: req.files.boxImg[0].originalname,
        price: parseFloat(req.body.price),
        quantity: parseInt(req.body.quantity),
        "soft-delete": false
    });
    res.redirect('/products');

});


// priduct id
router.put('/product', upload.fields([{name: 'coverImg'}, {name: 'boxImg'}]), async function(req,res,next){
    if(!req.session.isAdmin)
    {
        res.send(403);
        return;
    }
    let products = db.get('products');
    let product = await products.findOne({_id: req.body.id});
    await products.findOneAndUpdate({_id: req.body.id}, {$set: {
        title: req.body.title,
        category: req.body.category,
        brand: req.body.brand,
        quantity: req.body.quantity,
        cover: (!req.files || !req.files.coverImg || req.files.coverImg.length == 0)? product.cover : req.files.coverImg[0].originalname,
        box: (!req.files || !req.files.boxImg || req.files.boxImg.length == 0)? product.box : req.files.boxImg[0].originalname,
        price: parseFloat(req.body.price),
        "soft-delete": (req.body["soft-delete"] == "true"),

    }});
    res.redirect('/products'); 
    
});


// given id of product
router.delete('/product', function(req,res,next){
    if(!req.session.isAdmin)
    {
        res.send(403);
        return;
    }
    let products = db.get('products');
    products.findOneAndUpdate({_id: req.body.id}, {$set: {"soft-delete": true}});
    res.redirect('/products');
});


module.exports = router;