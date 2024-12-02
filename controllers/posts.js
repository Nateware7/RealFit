const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/Post");
const Comment= require("../models/Comment");
const User = require("../models/User");


module.exports = {
  getProfile: async (req, res) => {
    try {
      const user = await User.findById(req.params.userId); // Get the user by their ID
      const posts = await Post.find({ user: user._id }); // Get the posts of that user
      res.render("profile.ejs", { user: user, posts: posts, loggedInUser: req.user }); // Pass loggedInUser to the view
    } catch (err) {
      console.log(err);
      res.redirect("/"); // If there's an error, redirect to the homepage
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
      const posts = await Post.find()
        .sort({ createdAt: "desc" })
        .populate('user', 'profileImage userName') // Populate user field with specific data
        .lean();
      res.render("feed.ejs", { posts: posts });
    } catch (err) {
      console.log(err);
      res.redirect('/');
    }
  },  
  getPost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id).populate('user', 'userName').exec();
      const comments = await Comment.find({post: req.params.id}).populate('user', 'userName profileImage').sort({ createdAt: "desc" }).lean();
      // Fetch the user who created the post
      const postUser = await User.findById(post.user);
      res.render("post.ejs", { post: post, loggedInUser: req.user, comments: comments, postUser: postUser });
    } catch (err) {
      console.log(err);
      res.redirect('/')
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
      res.redirect(`/profile/${req.user.id}`);
    } catch (err) {
      console.log(err);
    }
  },
  likePost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      
      // Ensure the post exists
      if (!post) {
        return res.status(404).send("Post not found");
      }
  
      const userId = req.user.id;  // Make sure req.user.id is populated correctly
  
      // Check if the user has already liked the post
      if (post.likedBy.includes(userId)) {
        // User has already liked, so we will "unlike" (remove the like)
        post.likes--;  // Decrease the like count
        post.likedBy = post.likedBy.filter(id => id.toString() !== userId);  // Remove the user ID from likedBy
        console.log(`Unlike action: Likes decreased to ${post.likes}`);
      } else {
        // User hasn't liked the post yet, so we will "like" (add the like)
        post.likes++;  // Increase the like count
        post.likedBy.push(userId);  // Add the user ID to likedBy
        console.log(`Like action: Likes increased to ${post.likes}`);
      }
  
      // Save the updated post document
      await post.save();
  
      // Redirect to the post page to reflect the updated state
      res.redirect(`/post/${post.id}`);
    } catch (err) {
      console.log("Error during like/unlike action:", err);
      res.status(500).send("Server error");
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
      res.redirect(`/profile/${req.user.id}`);
    } catch (err) {
      res.redirect(`/profile/${req.user.id}`);
    }
  },
  updateProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
  
      user.bio = req.body.bio;
  
      if (req.file) {
        // Delete old profile image from Cloudinary if it exists
        if (user.profileImage) {
          await cloudinary.uploader.destroy(user.cloudinaryId);
        }
        
        // Upload new image to cloudinary
        const result = await cloudinary.uploader.upload(req.file.path);
        user.profileImage = result.secure_url;
        user.cloudinaryId = result.public_id;
      }
  
      await user.save();
      console.log("Profile updated successfully");
      res.redirect(`/profile/${req.user.id}`);
    } catch (err) {
      console.log(err);
      res.redirect("/edit");
    }
  },
};
