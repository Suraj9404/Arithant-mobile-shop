var express = require("express");
var routes = express.Router();
var exe = require("../conn");

function adminAuth(req, res, next) {
    if (!req.session.admin) {
        return res.redirect("/admin");
    }
    next();
}

routes.get("/", function(req, res) {
    res.render("admin/admin_login.ejs");
})

routes.use(async (req, res, next) => {
    if (req.session && req.session.adminId) {
        const rows = await exe("SELECT name, email FROM admins WHERE id = ?", [req.session.adminId]);
        if (rows.length > 0) {
            res.locals.admin = rows[0];
        } else {
            res.locals.admin = null;
        }
    } else {
        res.locals.admin = null;
    }
    next();
});

routes.post("/login",async function(req,res){

    var match = `SELECT * FROM admin_users WHERE username = ? AND password = ?`;
    var data = await exe(match,[req.body.email,req.body.password]);
    if(data.length > 0)
    {
        req.session.admin = data[0];
        res.redirect("/admin/dashboard");
    }else {
        res.send("Envalid Details! Please Enter Correct Details")
    }
})


routes.get("/logout",function(req,res){
    req.session.destroy();
    res.redirect("/admin/");
});

routes.get("/dashboard", async function(req, res) {

    let [productCount] = await exe("SELECT COUNT(*) AS count FROM products WHERE status='Active'");
    let [serviceCount] = await exe("SELECT COUNT(*) AS count FROM services");
    let [teamCount] = await exe("SELECT COUNT(*) AS count FROM team");
   

    res.render("admin/dashbord.ejs", {
        productCount: productCount.count,
        serviceCount: serviceCount.count,
        teamCount: teamCount.count,
     
    });
});



routes.get("/banner",adminAuth,async function(req,res){
    var sql = `select * from slider `;
    var images = await exe(sql);
    res.render("admin/slider.ejs",{images})
})
routes.get("/edit_slider/:sid",adminAuth,async function(req,res){
    var id = req.params.sid;
    var sql = `select * from slider where id = ?`;
    var info = await exe(sql,[id]);
   res.render("admin/update_slider.ejs", { info: info[0] });

})

routes.post("/update_slider/:sid",adminAuth, async function(req, res) {
    var d = req.body;
    var id = req.params.sid;

    var file_name;

       if (req.files && req.files.image) {
        var imageFile = req.files.image; 
        file_name = new Date().getTime() + "_" + imageFile.name; 
        imageFile.mv("public/images/" + file_name); 
    } else {
        var old_file = await exe(`SELECT * FROM slider WHERE id = ?`, [id]);
        file_name = old_file[0].image;
    }

    
    var sql = `UPDATE slider SET heading = ?, subheading = ?, button_text = ?, button_url = ?, image = ? WHERE id = ?`;
    var result = await exe(sql, [
        d.heading,
        d.subheading,
        d.button_text,
        d.button_url,
        file_name,
        id
    ]);

    res.redirect("/admin/banner"); 
}); 


 routes.get("/feature",adminAuth,async function(req,res){
        var sql = `select * from features `;
        var info = await exe(sql);  
    res.render("admin/feature.ejs",{info});
})

routes.get("/edit_feature/:fid",adminAuth,async function(req,res){
    var id = req.params.fid;  
    var sql = `select * from features where id = ?`;
    var info = await exe(sql,[id]); 
    res.render("admin/update_feature.ejs", { info: info[0] });
})    

routes.post("/update_feature/:sid",adminAuth, async function(req, res) {
    var d = req.body;
    var id = req.params.sid;

    console.log(req.files)
if (req.files && req.files.file_image && req.files.file_image.name) {
    var imageFile = req.files.file_image;
    file_name = new Date().getTime() + "_" + imageFile.name;
    imageFile.mv("public/images/" + file_name);
} else {
    var old_file = await exe(`SELECT * FROM features WHERE id = ?`, [id]);
    file_name = old_file[0].image;
}

    var sql = `UPDATE features SET title = ?, description = ?, image = ? WHERE id = ?`;
    var result = await exe(sql, [
        d.title,
        d.description,
        file_name,
        id
    ]);
   
    res.redirect("/admin/feature"); 
}); 

routes.get("/services",adminAuth,async function(req,res){
    var sql = `select * from services `;
    var services = await exe(sql);
    res.render("admin/services.ejs",{services});
})
routes.get("/update_service/:sid",adminAuth,async function(req,res){
    var id = req.params.sid;  
    var sql = `select * from services where id = ?`;
    var services = await exe(sql,[id]); 
    res.render("admin/update_service.ejs", { services: services[0] });
})  
routes.post("/update_service/:sid",adminAuth, async function(req, res) {
    var d = req.body;       
    var id = req.params.sid;
    if (req.files) {
        var imageFile = req.files.image;
        file_name = new Date().getTime() + "_" + imageFile.name;
        imageFile.mv("public/images/" + file_name);
    } else {
        var old_file = await exe(`SELECT * FROM services WHERE id = ?`, [id]);
        file_name = old_file[0].image;
    }
    console.log(file_name);
    var sql = `UPDATE services SET title = ?, description = ?, image = ? WHERE id = ?`;
    var result = await exe(sql, [
        d.title,
        d.description,
        file_name,
        id
    ]);
    res.redirect("/admin/services");
});


routes.get("/Our_Story",adminAuth,async function(req,res){
    var sql = `select * from about_us `;
    var info = await exe(sql);  
    res.render("admin/our_story.ejs",{info});
})

routes.get("/edit_our_story",adminAuth, async function(req, res) {
    var storyParts = await exe("SELECT * FROM about_us ORDER BY id DESC");
    res.render("admin/update_our_story.ejs", { storyParts });
});

routes.post("/update_our_story",adminAuth, async function(req, res) {
    var data = req.body;

    await exe("UPDATE about_us SET content = ? WHERE id = 1", [data.content1]);
    await exe("UPDATE about_us SET content = ? WHERE id = 2", [data.content2]);
    await exe("UPDATE about_us SET content = ? WHERE id = 3", [data.content3]);

    res.redirect("/admin/Our_Story");
});

routes.get("/mission",adminAuth, async function(req, res) {
    var missionData = await exe("SELECT * FROM mission LIMIT 1");
    res.render("admin/mission.ejs", { mission: missionData[0] });
});

routes.get("/edit_mission",adminAuth, async function(req, res) {
    var missionData = await exe("SELECT * FROM mission LIMIT 1");
    res.render("admin/edit_mission.ejs", { mission: missionData[0] });
});

routes.post("/update_mission",adminAuth, async function(req, res) {
    var content = req.body.content;
    await exe("UPDATE mission SET content = ? WHERE id = 1", [content]);
    res.redirect("/admin/mission");
});




routes.get("/vision",adminAuth, async function(req, res) {
    var vision = await exe("SELECT * FROM vision LIMIT 1");
    res.render("admin/vision.ejs", { vision: vision[0] });
});


routes.get("/edit_vision",adminAuth, async function(req, res) {
    var vision = await exe("SELECT * FROM vision LIMIT 1");
    res.render("admin/edit_vision.ejs", { vision: vision[0] });
});

routes.post("/update_vision",adminAuth, async function(req, res) {
    await exe("UPDATE vision SET content=? WHERE id=?", [req.body.content, req.body.id]);
    res.redirect("/admin/vision");
});


routes.get("/team",adminAuth, async function (req, res) {
    var data = await exe("SELECT * FROM team");
    res.render("admin/team_list.ejs", { team: data });
});


routes.get("/team/edit/:id",adminAuth, async function (req, res) {
    var data = await exe("SELECT * FROM team WHERE id=?", [req.params.id]);
    res.render("admin/team_edit.ejs", { member: data[0] });
});


routes.post("/team/update/:id",adminAuth, async function (req, res) {
    var id = req.params.id;
    var d = req.body;
        if(req.files){
            var file_name = new Date().getTime()+req.files.image.name;
            req.files.image.mv("public/images/" + file_name);
        }else {
            var old_file = await exe(`SELECT * FROM team WHERE id = ?`, [id]);
            file_name = old_file[0].image;
        }

        var sql = `UPDATE team SET name = ?, position = ?, description = ?, image = ? WHERE id = ?`;

   var result = await exe(sql, [
        d.name,
       d.position,
      d.description,
        file_name,
        id
    ]);

    res.redirect("/admin/team");
});


routes.get("/why_choose",adminAuth, async function(req, res) {
    var sql = `SELECT * FROM why_choose`
    var data = await exe(sql);
    res.render("admin/why_choose_view.ejs", {data:data[0]});
});


routes.get("/why_choose/edit/:id",adminAuth, async function(req, res) {
    var id = req.params.id;
    var rows = await exe("SELECT * FROM why_choose WHERE id = ?", [id]);
    res.render("admin/why_choose_form.ejs", { editData: rows[0] });
});


routes.post("/why_choose/edit/:id",adminAuth, async function(req, res) {
    var id = req.params.id;
    var d = req.body;
    await exe("UPDATE why_choose SET title=?, description=? WHERE id=?", [d.title, d.description, id]);
    res.redirect("/admin/why_choose");
});


routes.get("/our_journey",adminAuth, async function(req, res) {
    let data = await exe("SELECT * FROM our_journey");
    res.render("admin/our_journey_view.ejs", { data });
});


routes.get("/our_journey/edit/:id",adminAuth, async function(req, res) {
    let id = req.params.id;
    let row = await exe(`SELECT * FROM our_journey WHERE id=${id}`);
    res.render("admin/our_journey_edit.ejs", { record: row[0] });
});


routes.post("/our_journey/update/:id",adminAuth, async function(req, res) {
    let id = req.params.id;
    let { year_title, description } = req.body;
    await exe(`UPDATE our_journey SET year_title='${year_title}', description='${description}' WHERE id=${id}`);
    res.redirect("/admin/our_journey");
});

routes.get("/products",adminAuth, async function (req, res) {
    var products = await exe("SELECT * FROM products WHERE status='Active'");
    res.render("admin/products_list.ejs", { products });
});

routes.get("/products_add",adminAuth, async function (req, res) {
    res.render("admin/products_add.ejs");   
});


routes.post("/products_add",adminAuth, async function (req, res) {
    var d = req.body;

    var imgName = "";
    if (req.files && req.files.image) {
        var img = req.files.image;
        imgName = Date.now() + "_" + img.name;
        img.mv("public/uploads/" + imgName);
    }

    await exe(
        "INSERT INTO products (name, price, description, category, image, status) VALUES (?,?,?,?,?,?)",
        [d.name, d.price, d.description, d.category, imgName, "Active"]
    );

    res.redirect("/admin/products");
});



routes.get("/products_edit/:id",adminAuth,async function (req, res) {
    var id = req.params.id;
    var sql = `SELECT * FROM products WHERE id = ?`;
    var product = await exe(sql, [id]);
    res.render("admin/products_edit.ejs", { product:product[0] }); 
});



routes.post("/products_update/:id",adminAuth, async function (req, res) {
    var id = req.params.id;
    var d = req.body;

    var imgName = d.old_image;
    if (req.files && req.files.image) {
        var img = req.files.image;
        imgName = Date.now() + "_" + img.name;
        img.mv("public/uploads/" + imgName);
    }

    await exe(
        "UPDATE products SET name=?, price=?, description=?, image=? WHERE id=?",
        [d.name, d.price, d.description, imgName, id]
    );

    res.redirect("/admin/products");
});

routes.get("/products_delete/:id",adminAuth, async function (req, res) {
    var id = req.params.id;
    await exe("UPDATE products SET status='Deleted' WHERE id=?", [id]);
    res.redirect("/admin/products");
});

routes.get("/repair_services_add",adminAuth, function(req, res) {
    res.render("admin/add_repair_service.ejs");
});

routes.post("/repair_services_add", async function(req, res) {
    let { title, description, topic1, topic2, topic3, topic4, price, icon } = req.body;

    await db.query(
        "INSERT INTO repair_services (title, description, topic1, topic2, topic3, topic4, price, icon) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [title, description, topic1, topic2, topic3, topic4, price, icon]
    );

    res.redirect("/admin/repair_services");
});

    routes.get("/repair_services",adminAuth, async (req, res) => {
        let services = await exe("SELECT * FROM repair_services");
        res.render("admin/admin_services.ejs", { services });
    });

  
    routes.get("/edit_services/:id",adminAuth, async (req, res) => {
        let id = req.params.id;
        let service = await exe("SELECT * FROM repair_services WHERE id=?", [id]);
        res.render("admin/edit_service.ejs", { service: service[0] });
    });

    routes.post("/services_edit/:id",adminAuth, async (req, res) => {
        let id = req.params.id;
        let d = req.body;
        await exe(
            "UPDATE repair_services SET title=?, description=?, topic1=?, topic2=?, topic3=?, topic4=?, price=? WHERE id=?",
            [d.title, d.description, d.topic1, d.topic2, d.topic3, d.topic4, d.price, id]
        );
        res.redirect("/admin/repair_services");
    });

    routes.get("/admin/services_delete/:id",adminAuth, async (req, res) => {
        let id = req.params.id;
        await exe("DELETE FROM repair_services WHERE id=?", [id]);
        res.redirect("/admin/repair_services");
    });


routes.get("/service_process",adminAuth, async function(req, res) {
    let steps = await exe("SELECT * FROM service_process ORDER BY step_no");
    res.render("admin/service_process_list.ejs", { steps });
});


routes.get("/service_process_edit/:id",adminAuth, async function(req, res) {
    let step = await exe("SELECT * FROM service_process WHERE id=?", [req.params.id]);
    res.render("admin/edit_service_process.ejs", { step: step[0] });
});


routes.post("/service_process_edit/:id",adminAuth, async function(req, res) {
    let { title, description } = req.body;
    await exe("UPDATE service_process SET title=?, description=? WHERE id=?", 
                   [title, description, req.params.id]);
    res.redirect("/admin/service_process");
});


routes.get("/business_info",adminAuth, async function(req, res) {
    let info = await exe("SELECT * FROM business_info LIMIT 1");
    res.render("admin/business_info.ejs", { info: info[0] });
});

routes.get("/contact_info/:id", async function(req, res) {
    var id = req.params.id;
    let info = await exe("SELECT * FROM business_info WHERE id=?", [id]);
    res.render("admin/edit_contact_info.ejs", { info: info[0] });
  
});


routes.post("/contact_info",adminAuth, async function(req, res){
   var d = req.body;
   var result = await exe(`UPDATE business_info SET
        shop_name=?, shop_address_line1=?, shop_address_line2=?, city=?, state=?, country=?, pincode=?,
        phone_main=?, phone_emergency=?, email_general=?, email_support=?, hours_weekdays=?, hours_sunday=?, open_holidays=?
        WHERE id=?`,
        [
            d.shop_name, d.shop_address_line1, d.shop_address_line2,
            d.city, d.state, d.country, d.pincode,
            d.phone_main, d.phone_emergency,
            d.email_general, d.email_support,
            d.hours_weekdays, d.hours_sunday,
            d.open_holidays ? 1 : 0,
            d.id
        ]
    );
    res.redirect("/admin/business_info");
});

module.exports = routes; 