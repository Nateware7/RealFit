const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/Post");
const Comment= require("../models/Comment");
const User = require("../models/User");


module.exports = {
  getProfile: async (req, res) => {
    try {
      const posts = await Post.find({ user: req.user.id });
      const user = await User.findById(req.user.id);
      res.render("profile.ejs", { posts: posts, user: user });
  
    } catch (err) {
      console.log(err);
    }
  },  
  getAdd: async (req, res) => {
    try {
      const posts = await Post.find({ user: req.user.id });
      res.render("add.ejs", { posts: posts, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  getEdit: async (req, res) => {
    try {
      const posts = await Post.find({ user: req.user.id });
      res.render("edit.ejs", { posts: posts, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  getFeed: async (req, res) => {
    try {
      const posts = await Post.find().sort({ createdAt: "desc" }).lean();
      res.render("feed.ejs", { posts: posts });
    } catch (err) {
      console.log(err);
    }
  },
  getPost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      const comments = await Comment.find({post: req.params.id}).sort({ createdAt: "desc" }).lean();
      // Fetch the user who created the post
      const user = await User.findById(post.user);
      res.render("post.ejs", { post: post, user: req.user, comments: comments , user: user});
    } catch (err) {
      console.log(err);
    }
  },
  createPost: async (req, res) => {
    try {
      // Upload image to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);

      await Post.create({
        title: req.body.title,
        image: result.secure_url,
        cloudinaryId: result.public_id,
        caption: req.body.caption,
        likes: 0,
        user: req.user.id,
      });
      console.log("Post has been added!");
      res.redirect("/profile");
    } catch (err) {
      console.log(err);
    }
  },
  likePost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
  
      // Check if the user has already liked the post
      if (post.likedBy.includes(req.user.id)) {
        // If the user has already liked, prevent the action
        console.log("You have already liked this post.");
        return res.redirect(`/post/${req.params.id}`); // Redirect back to the post page
      }
  
      // If not, add the user to the likedBy array and increment the like count
      post.likes++;
      post.likedBy.push(req.user.id);
  
      await post.save();
  
      console.log("Likes +1");
      res.redirect(`/post/${req.params.id}`); // Redirect to the post page after liking
    } catch (err) {
      console.log(err);
      res.redirect(`/post/${req.params.id}`);
    }
  },  
  deletePost: async (req, res) => {
    try {
      // Find post by id
      let post = await Post.findById({ _id: req.params.id });
      // Delete image from cloudinary
      await cloudinary.uploader.destroy(post.cloudinaryId);
      // Delete post from db
      await Post.remove({ _id: req.params.id });
      console.log("Deleted Post");
      res.redirect("/profile");
    } catch (err) {
      res.redirect("/profile");
    }
  },
  updateProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user.id);

      user.bio = req.body.bio;


      await user.save();

      res.redirect("/profile");
    } catch (err) {
      console.log(err);
      res.redirect("/edit");
    }
  },
};
