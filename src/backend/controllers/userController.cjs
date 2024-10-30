//userController.cjs
const Usuarios = require("../models/Usuarios.cjs");
const Avatares = require("../models/Avatares.cjs");
const Nivel = require("../models/Nivel.cjs");
const bcrypt = require("bcrypt");
const {
  calcularNivelUsuario,
  calcularPorcentajeProgreso,
} = require("../nivelUtils.cjs");

const { Op } = require("sequelize");

exports.getUserDetails = async (req, res) => {
  try {
    const user = await Usuarios.findByPk(req.params.userId, {
      include: [{ model: Avatares, as: "avatar" }],
    });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Calcular el nivel y el porcentaje de progreso dinámicamente
    const nivel_user = await calcularNivelUsuario(user.xp_total);
    const porcentaje_progreso = await calcularPorcentajeProgreso(user.xp_total);

    // Preparar la respuesta
    const responseData = {
      id_usuario: user.id_usuario,
      nombre_user: user.nombre_user,
      apellido_user: user.apellido_user,
      email: user.email,
      username: user.username,
      avatar: user.avatar ? user.avatar.avatar : null,
      nivel_user: nivel_user,
      xp_total: user.xp_total,
      porcentaje_progreso: porcentaje_progreso,
    };
    res.json(responseData);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).send({ message: "Failed to get user details" });
  }
};
exports.updateUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      nombre_user,
      apellido_user,
      username,
      pass, // Nueva contraseña si se proporciona
    } = req.body;

    // Buscar al usuario por ID
    const user = await Usuarios.findByPk(userId);
    if (!user) {
      return res.status(404).send({ message: "Usuario no encontrado" });
    }

    // Actualizar campos si se proporcionan
    if (nombre_user) user.nombre_user = nombre_user;
    if (apellido_user) user.apellido_user = apellido_user;
    if (username) user.username = username;

    // Si se proporciona una nueva contraseña, encriptarla antes de asignarla
    if (pass) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(pass, saltRounds);
      user.pass = hashedPassword;
    }

    // Guardar los cambios
    await user.save();

    res.status(200).send({ message: "Información actualizada exitosamente" });
  } catch (error) {
    console.error("Error al actualizar la información del usuario:", error);
    res.status(500).send({ message: "Error al actualizar la información" });
  }
};
