// HabitRoutes.cjs
const express = require("express");
const router = express.Router();
const habitController = require("../controllers/habitController.cjs");

router.get("/user/:userId", habitController.getHabitsByUserId);
router.post("/", habitController.addHabit);
router.get("/recommendations/:userId", habitController.getHabitRecommendations);

module.exports = router;
