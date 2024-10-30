const Usuarios = require("../models/Usuarios.cjs");
const Avatares = require("../models/Avatares.cjs");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize"); // Importar Op de Sequelize

// Función para registrar un usuario
const registerUser = async (req, res) => {
  try {
    const { nombre_user, apellido_user, email, username, pass, uid_avatar } =
      req.body;

    // Verificar si el username o email ya existen
    const existingUser = await Usuarios.findOne({
      where: {
        [Op.or]: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "El nombre de usuario o correo electrónico ya están en uso.",
      });
    }

    // Encriptar la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(pass, saltRounds);

    // Crear un nuevo usuario en la base de datos con los valores por defecto
    const newUser = await Usuarios.create({
      nombre_user,
      apellido_user,
      email,
      username,
      pass: hashedPassword,
      uid_avatar,
      clase_user: "Aprendiz", // Valor por defecto
      nivel_user: 0, // Valor por defecto
      xp_semanal: 0, // Valor por defecto
      xp_total: 0, // Valor por defecto
    });

    // Busca el avatar correspondiente usando el uid_avatar
    const avatar = await Avatares.findOne({ where: { id_avatar: uid_avatar } });

    if (!avatar) {
      return res.status(404).json({ message: "Avatar no encontrado." });
    }

    // Respondemos con el nuevo usuario creado y la URL del avatar
    res.status(200).json({
      id: newUser.id_usuario,
      username: newUser.username,
      nombre_user: newUser.nombre_user,
      apellido_user: newUser.apellido_user,
      avatar: avatar.avatar,
      clase_user: newUser.clase_user,
      nivel_user: newUser.nivel_user,
      xp_semanal: newUser.xp_semanal,
      xp_total: newUser.xp_total,
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(500).json({ message: "Error al registrar usuario." });
  }
};

module.exports = {
  registerUser,
};
