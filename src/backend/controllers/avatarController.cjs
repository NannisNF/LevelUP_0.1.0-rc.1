//avatarController.cjs
const Avatar = require("../models/Avatar.cjs");

// Obtener todos los avatares de la base de datos
const getAvatars = async (res) => {
  try {
    const avatars = await Avatar.findAll(); // Usamos Sequelize para obtener todos los avatares
    res.status(200).json(avatars); // Devolvemos los avatares en formato JSON
  } catch (error) {
    console.error("Error al obtener avatares:", error);
    res.status(500).json({ message: "Error al obtener avatares." });
  }
};

module.exports = { getAvatars };
