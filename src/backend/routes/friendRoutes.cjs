// routes/friendRoutes.cjs
const express = require("express");
const router = express.Router();
const friendController = require("../controllers/friendController.cjs");

router.post("/add", friendController.sendFriendRequest);
router.get("/requests/:userId", friendController.getFriendRequests);
router.get(
  "/status/:myId/:otherUserId",
  friendController.checkFriendshipStatus
);
router.post("/accept", friendController.acceptFriendRequest);
router.post("/reject", friendController.rejectFriendRequest);
router.get("/:userId/search", friendController.searchFriends);
router.get(
  "/:userId/searchAvailable/:name",
  friendController.searchFriendsNotInActiveTournament
);
// Ruta para obtener la lista de amigos
router.get("/:userId/list", friendController.getFriendsList);

// Ruta para eliminar un amigo
router.post("/delete", friendController.deleteFriendship);

module.exports = router;
