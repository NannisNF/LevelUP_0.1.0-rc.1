//login.cjs
const express = require("express");
const router = express.Router();
const { loginUser } = require("../controllers/loginController.cjs");

router.post("/", loginUser);

module.exports = router;
