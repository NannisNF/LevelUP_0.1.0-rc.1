//Avatares.cjs
const { DataTypes } = require("sequelize");
const sequelize = require("../db.cjs"); // Tu configuración de la base de datos

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
      type: DataTypes.STRING, // Aquí guardas la URL del avatar
      allowNull: false,
    },
  },
  {
    tableName: "avatar", // Nombre de la tabla en la base de datos
    timestamps: false,
  }
);

module.exports = Avatares;
