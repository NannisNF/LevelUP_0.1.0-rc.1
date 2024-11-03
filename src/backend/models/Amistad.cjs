const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db.cjs");
const Usuarios = require("./Usuarios.cjs");

class Amistad extends Model {}

Amistad.init(
  {
    id_amistad: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_user1: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_user2: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    friend_status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending",
    },
  },
  {
    sequelize,
    modelName: "Amistad",
    tableName: "amistades",
    timestamps: false,
  }
);

Amistad.belongsTo(Usuarios, { foreignKey: "id_user1", as: "Sender" });
Amistad.belongsTo(Usuarios, { foreignKey: "id_user2", as: "Receiver" });

module.exports = Amistad;
