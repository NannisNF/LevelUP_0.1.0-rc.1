// searchController.cjs
const { Op } = require("sequelize");
const User = require("../models/Usuarios.cjs");
const Avatares = require("../models/Avatares.cjs");

exports.searchUsersByName = async (req, res) => {
  const { name, userId } = req.query;

  try {
    const users = await User.findAll({
      attributes: ["id_usuario", "username"],
      include: [
        {
          model: Avatares,
          as: "avatar",
          attributes: ["avatar"],
        },
      ],
      where: {
        username: {
          [Op.like]: `%${name}%`,
        },
        ...(userId && { id_usuario: { [Op.ne]: userId } }),
      },
    });
    res.json(users);
  } catch (error) {
    console.error("Error al buscar usuarios:", error);
    res.status(500).send(error.message);
  }
};
