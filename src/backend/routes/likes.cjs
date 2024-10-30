// routes/likes.cjs
const express = require("express");
const router = express.Router();
const likeController = require("../controllers/likeController.cjs");

router.post("/like", likeController.likePost);
router.post("/unlike", likeController.unlikePost);
router.get("/count/:postId", likeController.getLikesCount);
router.get("/hasLiked/:userId/:postId", likeController.hasLikedPost);

module.exports = router;
