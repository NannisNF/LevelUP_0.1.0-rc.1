//HabitosPredeterminados.cjs
const { Sequelize, Model, DataTypes } = require("sequelize");
const sequelize = require("../db.cjs");
const Clase = require("./Clase.cjs");

class HabitosPredeterminados extends Model {}

HabitosPredeterminados.init(
  {
    id_predeterminado: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    titulo: {
      type: DataTypes.STRING,
    },
    descripcion: {
      type: DataTypes.STRING,
    },
    clase_pred_habit: {
      type: DataTypes.INTEGER,
      references: {
        model: Clase,
        key: "idclase",
      },
    },
    xp_pred_habit: {
      type: DataTypes.INTEGER,
    },
  },
  {
    sequelize,
    modelName: "HabitosPredeterminados",
    tableName: "habitos_predeterminados",
    timestamps: false,
  }
);

module.exports = HabitosPredeterminados;
