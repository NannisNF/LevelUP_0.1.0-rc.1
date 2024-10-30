// nivelUtils.cjs
const Nivel = require("./models/Nivel.cjs");
const notificationController = require("./controllers/notificationController.cjs");
const { Op } = require("sequelize");

async function calcularNivelUsuario(xp_total) {
  const nivel = await Nivel.findOne({
    where: {
      xp_requerido: {
        [Op.lte]: xp_total,
      },
    },
    order: [["xp_requerido", "DESC"]],
  });
  return nivel ? nivel.nivel : 1;
}

async function calcularPorcentajeProgreso(xp_total) {
  const nivelActual = await Nivel.findOne({
    where: {
      xp_requerido: {
        [Op.lte]: xp_total,
      },
    },
    order: [["xp_requerido", "DESC"]],
  });

  const nivelSiguiente = await Nivel.findOne({
    where: {
      xp_requerido: {
        [Op.gt]: nivelActual ? nivelActual.xp_requerido : 0,
      },
    },
    order: [["xp_requerido", "ASC"]],
  });

  if (!nivelActual) {
    return 0;
  }

  let porcentajeProgreso = 100;
  if (nivelSiguiente) {
    const xpEnNivelActual = xp_total - nivelActual.xp_requerido;
    const xpNecesarioParaSiguienteNivel =
      nivelSiguiente.xp_requerido - nivelActual.xp_requerido;
    porcentajeProgreso =
      (xpEnNivelActual / xpNecesarioParaSiguienteNivel) * 100;
  }

  return porcentajeProgreso;
}
async function checkForLevelUp(user) {
  const currentLevel = user.nivel_user || 1;
  const newLevel = await calcularNivelUsuario(user.xp_total);
  if (newLevel > currentLevel) {
    user.nivel_user = newLevel;
    await user.save();

    await notificationController.createNotification(
      user.id_usuario,
      "level_up",
      `¡Felicidades! Has alcanzado el nivel ${newLevel}.`,
      { newLevel }
    );
  }
}

module.exports = {
  calcularNivelUsuario,
  calcularPorcentajeProgreso,
  checkForLevelUp,
};
