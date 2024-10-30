const { DataTypes } = require("sequelize");
const sequelize = require("../db.cjs");

const Nivel = sequelize.define(
  "Nivel",
  {
    nivel: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    xp_requerido: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "niveles",
    timestamps: false,
  }
);

module.exports = Nivel;
