var express = require('express');
var monk = require('monk');
var router = express.Router();
var db = monk('localhost:27017/cellphonekiosk');

router.get('/all', function(req,res,next){
    if(!req.session.isAdmin)
    {
        res.redirect('/');
    }
    let collection = db.get('products');
    collection.find({},function(err,products){
        if(err) throw err;
        let currentPage;
        if(!req.query.page)
            currentPage = 1;
        else
            currentPage = parseInt(req.query.page);
        let result = products.slice((currentPage-1)*9, currentPage*9);
        let nextPage = true;
        let previousPage = false;
        if(currentPage*9 >= products.length)
            nextPage = false;
        if(currentPage > 1)
            previousPage = true;
        res.render("products", {title: "All Products", isAdmin: true, isAll: true, products: result, username: req.session.user, nextPage: nextPage, previousPage: previousPage,currentPage: currentPage});
    });

})

router.get('/', function(req, res, next){
    let collection = db.get('products');
    collection.find({"soft-delete": false},function(err,products){
        if(err) throw err;
        let currentPage;
        if(!req.query.page)
            currentPage = 1;
        else
            currentPage = parseInt(req.query.page);
        let result = products.slice((currentPage-1)*9, currentPage*9);
        let nextPage = true;
        let previousPage = false;
        if(currentPage*9 >= products.length)
            nextPage = false;
        if(currentPage > 1)
            previousPage = true;
        if(req.session.user){
            if(req.session.isAdmin){
                res.render("products", {title: "Products", isAdmin: true, products: result, username: req.session.user, nextPage: nextPage, previousPage: previousPage,currentPage: currentPage});
                return;
            }
            res.render("products", {title: "Products", products: result, username: req.session.user, nextPage: nextPage, previousPage: previousPage, currentPage: currentPage});
            return;
        }
        res.render("products", {title: "Products", products: result, nextPage: nextPage, previousPage: previousPage, currentPage: currentPage});
    });
});

router.get('/search', function(req,res,next){
    let collection = db.get('products');
    if(!req.query.category || req.query.category === 'default')
        req.query.category = '';
    collection.find({title: {$regex: `^.*${req.query.title}.*$`, $options: 'i'}, category: {$regex: `^.*${req.query.category}.*$`, $options: 'i'}, "soft-delete": false}, function(err, products){
        if(err) throw err;
        let currentPage;
        if(!req.query.page)
            currentPage = 1;
        else
            currentPage = parseInt(req.query.page);
        let result = products.slice((currentPage-1)*9, currentPage*9);
        let nextPage = true;
        let previousPage = false;
        if(currentPage*9 >= products.length)
            nextPage = false;
        if(currentPage > 1)
            previousPage = true;
        if(req.session.user){
            if(req.session.isAdmin){
                if(req.query.category == "")
                {
                    res.render("search", {title: "Search", isAdmin: true, products: result, username: req.session.user, nextPage: nextPage, previousPage: previousPage, searchTerm: req.query.title, currentPage: currentPage});
                    return;
                }
                else
                {
                    res.render("search", {title: "Search", isAdmin: true, products: result, username: req.session.user, nextPage: nextPage, previousPage: previousPage, searchTerm: req.query.title, category: req.query.category, currentPage: currentPage});
                    return;
                }
                
            }
            if(req.category =="")
            {
                res.render("search", {title: "Search", products: result, username: req.session.user, nextPage: nextPage, previousPage: previousPage, searchTerm: req.query.title, currentPage: currentPage});
                return;
            }
            else
            {
                res.render("search", {title: "Search", products: result, username: req.session.user, nextPage: nextPage, previousPage: previousPage, searchTerm: req.query.title, category: req.query.category, currentPage: currentPage});
                return;
            }
            
        } 
        if(req.category == "")
        {
            res.render('search', {title: "Search", products: result, nextPage: nextPage, previousPage: previousPage, searchTerm: req.query.title, category: req.query.category, searchTerm: req.query.title,currentPage: currentPage});
            return;
        }
        else
        {
            res.render('search', {title: "Search", products: result, nextPage: nextPage, previousPage: previousPage, searchTerm: req.query.title, category: req.query.category, currentPage: currentPage});
            return;
        }
        
  });
})

router.get('/:id', function(req,res,next){
    let collection = db.get('products');
    collection.findOne({_id: req.params.id}, function(err,product){
        if(err) throw err;
        if(req.session.user)
        {
            if(req.session.isAdmin)
            {
                res.render('product', {title: `${product.title}`, product: product, username: req.session.user, isAdmin: true});
                return;
            }
            res.render('product', {title: `${product.title}`, product: product, username: req.session.user, isAdmin: false});
            
        }
        res.render('product', {title: `${product.title}`, product: product});
        
        
    });
});




module.exports = router;