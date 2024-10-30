// register.cjs
const express = require("express");
const router = express.Router();
const { registerUser } = require("../controllers/registerController.cjs"); // Importamos el controlador

// Definimos la ruta POST para registrar un usuario
router.post("/", registerUser);

module.exports = router;
