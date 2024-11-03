//Notification.cjs
const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db.cjs");
const Usuarios = require("./Usuarios.cjs");

class Notification extends Model {}

Notification.init(
  {
    id_notification: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Usuarios,
        key: "id_usuario",
      },
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING,
    },
    data: {
      type: DataTypes.JSON,
    },
    read_status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "Notification",
    tableName: "notifications",
    timestamps: false,
  }
);

Notification.belongsTo(Usuarios, { foreignKey: "user_id" });

module.exports = Notification;
