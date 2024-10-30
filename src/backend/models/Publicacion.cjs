// models/Publicacion.cjs
const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db.cjs");
const Likes = require("./Likes.cjs");
const Usuarios = require("./Usuarios.cjs");

class Publicacion extends Model {}

Publicacion.init(
  {
    id_publicacion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    uid_post: { type: DataTypes.INTEGER, allowNull: false },
    post_hid: { type: DataTypes.INTEGER, allowNull: false },
    cont_text: { type: DataTypes.STRING, allowNull: false },
    cont_media: { type: DataTypes.STRING, allowNull: true }, // URL o path al archivo
    post_date: { type: DataTypes.DATE, allowNull: false },
  },
  {
    sequelize,
    modelName: "Publicacion",
    tableName: "publicacion",
    timestamps: false,
  }
);

module.exports = Publicacion;
