const Comment = require("../models/Comment");
const Post = require("../models/Post");

module.exports = {
  createComment: async (req, res) => {
    try {
      // Create the comment
      await Comment.create({
        comment: req.body.comment,
        likes: 0,
        post: req.params.id,
        user: req.user.id,
      });

      // Increment the comment count in the Post model
      await Post.findByIdAndUpdate(req.params.id, { $inc: { comments: 1 } });

      console.log("Comment has been added and post's comment count updated!");
      res.redirect("/post/" + req.params.id);
    } catch (err) {
      console.log(err);
    }
  },
};
