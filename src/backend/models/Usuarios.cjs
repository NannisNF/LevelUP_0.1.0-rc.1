//Usuarios.cjs
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../db.cjs");
const Avatares = require("./Avatares.cjs");
const Nivel = require("./Nivel.cjs");

const Usuarios = sequelize.define(
  "Usuarios",
  {
    id_usuario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre_user: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    apellido_user: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    pass: {
      type: DataTypes.STRING(60),
      allowNull: false,
    },
    uid_avatar: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    clase_user: {
      type: DataTypes.STRING(25),
      allowNull: true,
    },
    nivel_user: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    xp_semanal: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    xp_total: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "usuarios",
    timestamps: false,
  }
);

// Relacion Usuarios - Avatares
Usuarios.belongsTo(Avatares, { foreignKey: "uid_avatar", as: "avatar" });
Usuarios.belongsTo(Nivel, { foreignKey: "nivel_user", as: "nivel" });
Usuarios.addScope(
  "defaultScope",
  {
    include: [],
  },
  { override: true }
);

module.exports = Usuarios;
