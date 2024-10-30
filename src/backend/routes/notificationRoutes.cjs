//notificationRoutes.cjs
const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController.cjs");

router.get("/:userId", notificationController.getNotifications);
router.put("/read/:notificationId", notificationController.markAsRead);

module.exports = router;
