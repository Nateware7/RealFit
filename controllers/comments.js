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
      res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      console.log(err);
      res.redirect(`/post/${req.params.id}`);
    }
  },

  deleteComment: async (req, res) => {
    try {
      const comment = await Comment.findById(req.params.commentId);

      // Check if the logged-in user is the owner of the comment
      if (comment.user.toString() !== req.user.id.toString()) {
        return res.redirect(`/post/${comment.post}`);
      }

      // Delete the comment
      await comment.remove();
      console.log("Deleted Comment");

      // Decrement the comment count in the Post model
      await Post.findByIdAndUpdate(comment.post, { $inc: { comments: -1 } });

      res.redirect(`/post/${comment.post}`);
    } catch (err) {
      console.log(err);
      res.redirect(`/post/${req.params.id}`);
    }
  },
}