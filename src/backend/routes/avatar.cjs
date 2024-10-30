//avtar.cjs
const express = require("express");
const router = express.Router();
const { getAvatars } = require("../controllers/avatarController"); // Importa el controlador de avatars

// Ruta para obtener todos los avatares
router.get("/avatars", getAvatars);

module.exports = router;
