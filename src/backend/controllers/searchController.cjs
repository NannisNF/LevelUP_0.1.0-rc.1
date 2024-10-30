// searchController.cjs
const { Op } = require("sequelize");
const User = require("../models/Usuarios.cjs");
const Avatares = require("../models/Avatares.cjs");

exports.searchUsersByName = async (req, res) => {
  const { name, userId } = req.query;

  try {
    const users = await User.findAll({
      attributes: ["id_usuario", "username"], // Asegúrate de incluir los atributos que necesitas mostrar
      include: [
        {
          model: Avatares,
          as: "avatar", // Asegúrate de que el alias 'avatar' esté configurado correctamente en tus modelos
          attributes: ["avatar"], // Este es el campo que contiene la URL del avatar
        },
      ],
      where: {
        username: {
          [Op.like]: `%${name}%`,
        },
        ...(userId && { id_usuario: { [Op.ne]: userId } }), // Añade esta condición solo si userId está presente
      },
    });
    res.json(users);
  } catch (error) {
    console.error("Error al buscar usuarios:", error);
    res.status(500).send(error.message);
  }
};
