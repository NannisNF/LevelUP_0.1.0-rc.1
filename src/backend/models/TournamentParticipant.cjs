// models/TournamentParticipant.cjs
const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db.cjs");
const Usuarios = require("./Usuarios.cjs");
const Tournament = require("./Tournament.cjs");

class TournamentParticipant extends Model {}

TournamentParticipant.init(
  {
    id_participation: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tournament_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Tournament,
        key: "id_tournament",
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Usuarios,
        key: "id_usuario",
      },
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending",
    },
    xp_accumulated: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    bet_amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: "TournamentParticipant",
    tableName: "tournament_participants",
    timestamps: false,
  }
);

TournamentParticipant.belongsTo(Tournament, { foreignKey: "tournament_id" });
TournamentParticipant.belongsTo(Usuarios, { foreignKey: "user_id" });

module.exports = TournamentParticipant;
