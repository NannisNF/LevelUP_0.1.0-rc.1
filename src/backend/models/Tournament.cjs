// models/Tournament.cjs
const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db.cjs");
const Usuarios = require("./Usuarios.cjs");

class Tournament extends Model {}

Tournament.init(
  {
    id_tournament: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    creator_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Usuarios,
        key: "id_usuario",
      },
    },
    bet_amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending",
    },
  },
  {
    sequelize,
    modelName: "Tournament",
    tableName: "tournaments",
    timestamps: false,
  }
);

Tournament.belongsTo(Usuarios, { as: "creator", foreignKey: "creator_id" });

module.exports = Tournament;
