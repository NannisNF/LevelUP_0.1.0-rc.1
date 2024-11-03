//LogInController
const Usuarios = require("../models/Usuarios.cjs");
const Avatares = require("../models/Avatares.cjs");
const bcrypt = require("bcrypt");
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Busca al usuario por su username
    const user = await Usuarios.findOne({
      where: { username },
      include: [
        {
          model: Avatares, // Relacionamos con el modelo de avatares
          as: "avatar",
          attributes: ["avatar"],
        },
      ],
    });

    if (!user) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    // Comparar la contraseña
    const passwordMatch = await bcrypt.compare(password, user.pass);
    if (!passwordMatch) {
      return res.status(400).send({ message: "Credenciales inválidas." });
    }

    // Si todo está correcto, devuelve la información del usuario, incluyendo el avatar, nombre y apellido
    res.status(200).json({
      message: "Inicio de sesión exitoso",
      id: user.id_usuario,
      username: user.username,
      nombre_user: user.nombre_user, // Aquí enviamos el nombre
      apellido_user: user.apellido_user, // Aquí enviamos el apellido
      avatar: user.avatar.avatar, // Aquí se accede a la URL del avatar desde la relación
    });
  } catch (error) {
    console.error("Error durante el inicio de sesión:", error);
    res.status(500).json({ message: "Error durante el inicio de sesión." });
  }
};

module.exports = { loginUser };
