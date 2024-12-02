const express = require("express");
const router = express.Router();
const commentsController = require("../controllers/comments");
const { ensureAuth } = require("../middleware/auth");

//Comment Routes - simplified for now
router.post("/createComment/:id", ensureAuth, commentsController.createComment);
// In routes/comments.js
router.post("/deleteComment/:commentId", ensureAuth, commentsController.deleteComment);


module.exports = router;