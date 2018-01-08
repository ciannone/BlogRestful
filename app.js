var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var methodOverride = require("method-override");
var expressSanitizer = require("express-sanitizer");

//APP CONFIG
mongoose.connect("mongodb://localhost/blog_restful", {useMongoClient: true});
mongoose.Promise = global.Promise;
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.set("view engine", "ejs");
app.use(methodOverride("_method"));


//MONGOOSE/MODEL CONFIG
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);

// Blog.create({
//     title:"test blog",
//     image:"https://images.unsplash.com/photo-1500479694472-551d1fb6258d?auto=format&fit=crop&w=1050&q=80",
//     body:"this is a blog post!",
// });

//RESTFUL ROUTES

app.get("/", function(req, res){
    res.redirect("/blogs");
});

//INDEX
app.get("/blogs", function(req, res) {
   Blog.find({}, function(err, blog){
       if(err){
           console.log("error");
       } else {
           res.render("index", {blog: blog});
       }
   }); 
});

//NEW
app.get("/blogs/new", function(req, res){
   res.render("new"); 
});

//CREATE
app.post("/blogs", function(req, res){
   //create Blog
   Blog.create(req.body.blog, function(err, newBlog){
       if(err){
           res.render("new");
       } else {
           //then redirect to the index
           res.redirect("/blogs");
       }
   }); 
});

//SHOW
app.get("/blogs/:id", function(req, res) {
   Blog.findById(req.params.id, function(err, foundBlog){
       if(err){
           res.redirect("/blogs");
       } else {
           res.render("show", {blog: foundBlog});
       }
   }); 
});

//EDIT
app.get("/blogs/:id/edit", function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog){
       if(err){
           res.redirect("/blogs");
       } else {
           res.render("edit", {blog: foundBlog});
       }
    });
});

//UPDATE
app.put("/blogs/:id", function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(err){
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

//DELETE
app.delete("/blogs/:id", function(req, res){
    //destroy blog
    Blog.findByIdAndRemove(req.params.id, function(err){
       if(err){
           res.redirect("/blogs");
       } else {
           res.redirect("/blogs");
       }
    });
    //redirect page
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("server up");
});