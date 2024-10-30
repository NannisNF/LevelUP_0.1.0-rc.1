//Habitos.cjs
const { Sequelize, Model, DataTypes } = require("sequelize");
const sequelize = require("../db.cjs");
const Clase = require("./Clase.cjs");

class Habitos extends Model {}

Habitos.init(
  {
    id_habito: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    habit_uid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    titulo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING,
    },
    inicio_habit: {
      type: DataTypes.DATE,
    },
    fin_habit: {
      type: DataTypes.DATEONLY,
    },
    xp_habito: {
      type: DataTypes.INTEGER,
    },
    clase_habit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Clase,
        key: "idclase",
      },
    },
    status_habito: {
      type: DataTypes.STRING,
      defaultValue: "En progreso", //Por defecto
    },
  },
  {
    sequelize,
    modelName: "Habitos",
    tableName: "habitos",
    timestamps: false,
  }
);

// Estableciendo la relación
Habitos.belongsTo(Clase, { as: "clase", foreignKey: "clase_habit" });

module.exports = Habitos;
