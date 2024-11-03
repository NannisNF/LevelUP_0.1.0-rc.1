//searchRoutes.cjs
const express = require("express");
const router = express.Router();
const searchController = require("../controllers/searchController.cjs");

router.get("/users", searchController.searchUsersByName);

module.exports = router;
