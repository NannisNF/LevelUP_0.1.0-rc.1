//userRoutes.cjs
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController.cjs");

// Ruta para obtener detalles de un usuario específico
router.get("/:userId", userController.getUserDetails);

// Ruta para actualizar la información de un usuario
router.put("/update/:userId", userController.updateUserDetails);

module.exports = router;
