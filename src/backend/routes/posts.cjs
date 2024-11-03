//posts.cjs
const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController.cjs");

router.post(
  "/",
  postController.upload.single("cont_media"),
  postController.createPost
);

router.get("/", postController.getPosts);
router.get("/user/:userId", postController.getPostsByUserId);
router.get("/friends/:userId", postController.getPostsFromFriends);
router.get("/user/:userId/withLikes", postController.getPostsByUserIdWithLikes);

module.exports = router;
