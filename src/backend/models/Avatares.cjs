//Avatares.cjs
const { DataTypes } = require("sequelize");
const sequelize = require("../db.cjs");

const Avatares = sequelize.define(
  "Avatares",
  {
    id_avatar: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name_avatar: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "avatar",
    timestamps: false,
  }
);

module.exports = Avatares;
