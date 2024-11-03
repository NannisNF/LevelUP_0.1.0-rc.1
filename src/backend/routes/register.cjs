// register.cjs
const express = require("express");
const router = express.Router();
const { registerUser } = require("../controllers/registerController.cjs");

router.post("/", registerUser);

module.exports = router;
