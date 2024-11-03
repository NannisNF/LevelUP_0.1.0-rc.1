//Clase.cjs
const { Sequelize, Model, DataTypes } = require("sequelize");
const sequelize = require("../db.cjs");

class Clase extends Model {}

Clase.init(
  {
    idclase: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nameclase: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    claseurl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Clase",
    tableName: "clase",
  }
);

module.exports = Clase;
