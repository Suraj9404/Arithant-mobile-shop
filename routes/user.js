var express = require("express");
var router = express.Router();
var exe = require("../conn");


router.post("/register", async function(req, res) {
    const d = req.body;
    const sql = `INSERT INTO users (name, mobile, email, password) VALUES (?, ?, ?, ?)`;
     var result = await exe(sql, [d.fullname, d.mobile, d.email, d.password]);
    res.redirect("/");
});

router.post("/login", async function(req, res) {
    var d = req.body;
    var sql = `SELECT * FROM users WHERE email = ? AND password = ?`;
    var result = await exe(sql, [d.username, d.password]);

    if(result.length > 0){
        req.session.user = result[0]; 
        res.redirect("/");
    } else {
        res.send("<script>alert('Invalid credentials'); window.location.href='/';</script>");
    }
});

router.post("/", async function(req, res) {
    var d = req.body;
    var sql = `SELECT * FROM users WHERE email = ? AND password = ?`;
    var result = await exe(sql, [d.username, d.password]);

    if (result.length > 0) {
        req.session.user = result[0];
        res.redirect("/"); 
    } else {
        res.send("<script>alert('Invalid credentials'); window.location.href='/';</script>");
    }
});



router.get("/", async function(req, res) {
    var slider = await exe("SELECT * FROM slider");
    var services = await exe("SELECT * FROM services");
    var features = await exe("SELECT * FROM features");
    var user = req.session.user;
    var reviews = await exe("SELECT * FROM reviews ORDER BY created_at DESC LIMIT 3");

    var paket = { slider, services, features, reviews, user };
    res.render("user/home.ejs", paket);
});

router.get("/product", async function (req, res) {
    var user = req.session.user;

    var allProducts = await exe("SELECT * FROM products WHERE status='Active'");
    var mobiles = allProducts.filter(p => p.category === "Mobile");
    var watches = allProducts.filter(p => p.category === "Watches");
    var headphones = allProducts.filter(p => p.category === "Headphones");

    
    var reviews = await exe("SELECT * FROM reviews ORDER BY created_at DESC");

    res.render("user/product.ejs", {
        user,
        allProducts,
        mobiles,
        watches,
        headphones,
        reviews 
    });
});


router.get("/product_details/:id", async function (req, res) {
    var user = req.session.user;
    var id = req.params.id;

 
    var productData = await exe("SELECT * FROM products WHERE id=? AND status='Active'", [id]);

    if (productData.length === 0) {
        return res.render("user/product.ejs", { user });
    }

    res.render("user/product_details.ejs", {
        user,
        product: productData[0]
    });
});


router.get("/service", async function(req, res) {
    var user = req.session.user;
    let services = await exe("SELECT * FROM repair_services");
    res.render("user/services.ejs", { user, services });
});


router.get("/contact", async function(req, res) {
    var user = req.session.user;

    let info = await exe("SELECT * FROM business_info LIMIT 1");

    res.render("user/contact.ejs", {
        user,
        info: info[0] 
    });
});

router.get("/about", async function (req, res) {
    var user = req.session.user;
    var info = await exe("SELECT * FROM about_us");
    var vision = await exe("SELECT * FROM vision");
    var mission = await exe("SELECT * FROM mission");
    var team = await exe("SELECT * FROM team");
    var why_choose = await exe("SELECT * FROM why_choose");
    var our_journey = await exe("SELECT * FROM our_journey");
    var reviews = await exe("SELECT * FROM reviews ORDER BY created_at DESC LIMIT 6");

    res.render("user/about.ejs", {
        user,
        info,
        vision,
        mission,
        team,
        why_choose,
        our_journey,
        reviews
    });
});


router.post("/submit_review", async function (req, res) {
    var productId = req.body.product_id;
    var name = req.body.name;
    var review = req.body.review;
    var rating = req.body.rating;

   
   var result = await exe(
        "INSERT INTO reviews (product_id, name, review, rating) VALUES (?, ?, ?, ?)",
        [productId, name, review, rating]
    );
    res.redirect("/product_details/" + productId);
});


router.post("/add_custemer", async function(req, res) {
    var d = req.body;
    var sql = `INSERT INTO customers (name, email, mobile, message) VALUES (?, ?, ?, ?)`;
    await exe(sql, [d.name, d.email, d.mobile, d.message]);
    // res.send(d)
    res.redirect("/contact");
});

module.exports = router;
