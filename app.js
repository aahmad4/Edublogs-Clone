// Adding dependencies
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var methodOverride = require("method-override");
var expressSanitizer = require("express-sanitizer");

// Setting up Mongo database called blogapp
mongoose.connect("mongodb://localhost:27017/blogapp", {useNewUrlParser: true, useUnifiedTopology: true});

// Allowing the use of extracting body of ejs files 
app.use(bodyParser.urlencoded({extended: true}));

// Allowing the assumption of files to be .ejs automatically
app.set("view engine", "ejs");

// Allowing the use of styling later
app.use(express.static("public"));

// Use expressSanitizer
app.use(expressSanitizer());

// Use Method methodOverride
app.use(methodOverride("_method"));

// Creating a schema for a blog post to follow
var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type: Date, default: Date.now}
});

// Compile blog into database model
var Blog = mongoose.model("Blog", blogSchema);

Blog.create({
	title: "Test Blog Post",
	image: "https://images-na.ssl-images-amazon.com/images/I/71UTRxPv8ML._AC_UY500_.jpg",
	body: "This is a test post that shows the redskins logo!"
});

// Restful Routes

// Redirecting default page to blog page
app.get("/", function(req, res) {
	res.redirect("/blogs");
});

// Finding blog entry in database and rendering it in index.ejs
app.get("/blogs", function(req, res) {
	Blog.find({}, function(err, blogs) {
		if (err) {
			console.log(err);
		} else {
			res.render("index", {blogs: blogs});
		}
	});
});

// New Route
app.get("/blogs/new", function(req, res) {
	res.render("new");
});

// Create Route
app.post("/blogs", function(req, res) {
	// Makes it so that users can't enter script JavaScript tags when creating a post
	req.body.blog.body = req.sanitize(req.body.blog.body);
	// Create Blog
	Blog.create(req.body.blog, function(err, newBlog) {
		if (err) {
			res.render("new");
		} else {
			res.redirect("/blogs");
		}
	});
});

// Show Route
app.get("/blogs/:id", function(req, res) {
	Blog.findById(req.params.id, function(err, foundBlog){
		if (err) {
			res.redirect("/blogs");
		} else {
			res.render("show", {blog:foundBlog})
		}
	});
});

// Edit Route 
app.get("/blogs/:id/edit", function(req, res) {
	Blog.findById(req.params.id, function(err, foundBlog){
		if (err) {
			res.redirect("/blogs");
		} else {
			res.render("edit", {blog: foundBlog})
		}
	});
});

// Update Route 
app.put("/blogs/:id", function(req, res){
	// Makes it so that users can't enter script JavaScript tags when editing a post
	req.body.blog.body = req.sanitize(req.body.blog.body);
	// Update
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
		if (err) {
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs/" + req.params.id);
		}
	});
});

// Delete Route 
app.delete("/blogs/:id", function(req, res) {
	// Destroy Blog
	Blog.findByIdAndRemove(req.params.id, function(err) {
		if (err) {
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs");
		}
	});
});

// Starting my server
app.listen(3000, function() { 
  console.log('Server listening on port 3000'); 
});