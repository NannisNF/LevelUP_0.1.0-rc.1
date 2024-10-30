// models/Likes.cjs
const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db.cjs");
const Usuarios = require("./Usuarios.cjs");
const Publicacion = require("./Publicacion.cjs");

class Likes extends Model {}

Likes.init(
  {
    id_like: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_publicacion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Publicacion,
        key: "id_publicacion",
      },
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Usuarios,
        key: "id_usuario",
      },
    },
  },
  {
    sequelize,
    modelName: "Likes",
    tableName: "likes",
    timestamps: false,
  }
);

module.exports = Likes;
