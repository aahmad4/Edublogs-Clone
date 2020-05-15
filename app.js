// Requiring Express
var express = require("express");

// Adding app Param
var app = express();

// Requiring body parser
var bodyParser = require("body-parser");

// Requiring mongoose for database
var mongoose = require("mongoose");

// Adding override of methods
var methodOverride = require("method-override");

// Adding expressSanitizier to help with eliminating Script tags for end user content
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
	// This creates a default Date which is the current date, if none else is specified
	created: {type: Date, default: Date.now}
});

// Compile blog into database model
var Blog = mongoose.model("Blog", blogSchema);

// This is unneeded, but just used to test that a proper entry is being made to the database, with the required Schema patterns
Blog.create({
	title: "Test Blog Post",
	image: "https://images-na.ssl-images-amazon.com/images/I/71UTRxPv8ML._AC_UY500_.jpg",
	body: "This is a test post that shows the redskins logo!"
});

// These Are All The Restful Routes

// Redirecting default page to blog page
app.get("/", function(req, res) {
	// This just means that if someone goes to the default page of the domain, it will redirect you to the /blogs page
	res.redirect("/blogs");
});

// Finding blog entry in database and rendering it in index.ejs
app.get("/blogs", function(req, res) {
	// This is the default page which shows all the posts
	
	// This part of the code uses the variable `Blog` which is the database mongoose model, and it gives you a param `blogs` which represents each entry
	Blog.find({}, function(err, blogs) {
		// This just checks for errors but if there's none, it sends you index.ejs and gives you the blog param
		if (err) {
			console.log(err);
		} else {
			res.render("index", {blogs: blogs});
		}
	});
});

// New Route
app.get("/blogs/new", function(req, res) {
	// This simply redirects you to the new post page which lets you create a new blog post
	res.render("new");
});

// Create Route
app.post("/blogs", function(req, res) {
	// This post route is at /blogs because that's where the new post is supposed to display
	// What is happening is on the new post page, there is a post request being made which is meant to create a new Blog entry
	
	// Makes it so that users can't enter script JavaScript tags when creating a post
	req.body.blog.body = req.sanitize(req.body.blog.body);
	
	// Create a new Blog entry
	Blog.create(req.body.blog, function(err, newBlog) {
		// If there's an error, redirect you to that same new page, otherwise direct you to the blog home page
		if (err) {
			res.render("new");
		} else {
			res.redirect("/blogs");
		}
	});
});

// Show Route
app.get("/blogs/:id", function(req, res) {
	// This part is meant to show you each individual Blog post on its own
	
	// This passes you the foundBlog param as the right Blog post you want
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
	// This is the edit page that lets you fix an already made Blog Post
	
	// Once again, finding the right blog post and passing it as foundBlog
	Blog.findById(req.params.id, function(err, foundBlog){
		// Sends you to the edit page if there aren't any errors
		if (err) {
			res.redirect("/blogs");
		} else {
			res.render("edit", {blog: foundBlog})
		}
	});
});

// Update Route 
app.put("/blogs/:id", function(req, res){
	// This is a put route which is on the edit page to update it
	
	// Makes it so that users can't enter script JavaScript tags when editing a post
	req.body.blog.body = req.sanitize(req.body.blog.body);
	
	// This part uses the findByIdAndUpdate method and passes the updatedBlog
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
