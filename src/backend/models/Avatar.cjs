//avatar.cjs
const { DataTypes } = require("sequelize");
const sequelize = require("../db.cjs");

const Avatar = sequelize.define("avatar", {
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
    allowNull: true,
  },
});

module.exports = Avatar;
