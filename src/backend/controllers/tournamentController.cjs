// controllers/tournamentController.cjs
const Tournament = require("../models/Tournament.cjs");
const TournamentParticipant = require("../models/TournamentParticipant.cjs");
const Usuarios = require("../models/Usuarios.cjs");
const Avatares = require("../models/Avatares.cjs");
const notificationController = require("./notificationController.cjs");
const nivelUtils = require("../nivelUtils.cjs");
const { checkForLevelUp } = require("../nivelUtils.cjs");
const { Op } = require("sequelize");

// Crear torneo e invitar participantes
exports.createTournament = async (req, res) => {
  const { creator_id, participant_ids, bet_amount } = req.body;

  // Validar bet_amount
  if (!bet_amount || bet_amount <= 0) {
    return res.status(400).send({ message: "Bet amount inválido." });
  }

  try {
    // Deductir la apuesta del XP total del creador
    const creator = await Usuarios.findByPk(creator_id);
    if (!creator) {
      return res.status(404).send({ message: "Creador no encontrado." });
    }
    if (creator.xp_total < bet_amount) {
      return res.status(400).send({
        message: "No tienes suficiente XP para crear el torneo.",
      });
    }
    creator.xp_total -= bet_amount;
    await creator.save();

    const tournament = await Tournament.create({
      creator_id,
      bet_amount,
      start_date: new Date(),
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Una semana después
      status: "pending", // El torneo se activa cuando todos hayan aceptado
    });

    // Añadir al creador como participante con estado 'accepted'
    await TournamentParticipant.create({
      tournament_id: tournament.id_tournament,
      user_id: creator_id,
      status: "accepted",
      bet_amount: bet_amount, // El creador ya pagó la apuesta
    });

    // Crear registros para los participantes invitados
    for (const participant_id of participant_ids) {
      await TournamentParticipant.create({
        tournament_id: tournament.id_tournament,
        user_id: participant_id,
        status: "pending",
        bet_amount: 0, // Se actualizará al aceptar
      });
      // Enviar notificación al participante (opcional)
    }

    res.status(201).send({
      message: "Torneo creado y solicitudes enviadas",
      tournament_id: tournament.id_tournament,
    });
  } catch (error) {
    console.error("Error al crear el torneo:", error);
    res.status(500).send({
      message: "Error al crear el torneo",
      error: error.message,
    });
  }
};

// Aceptar invitación al torneo
exports.acceptTournamentInvitation = async (req, res) => {
  const { user_id, tournament_id } = req.body;

  try {
    const participant = await TournamentParticipant.findOne({
      where: { tournament_id, user_id },
    });

    if (!participant || participant.status !== "pending") {
      return res.status(400).send({ message: "Invitación inválida." });
    }

    // Obtener el monto de la apuesta del torneo
    const tournament = await Tournament.findByPk(tournament_id);
    if (!tournament) {
      return res.status(404).send({ message: "Torneo no encontrado." });
    }
    const betAmount = tournament.bet_amount;

    const user = await Usuarios.findByPk(user_id);

    if (user.xp_total < betAmount) {
      return res
        .status(400)
        .send({ message: "No tienes suficiente XP para unirte al torneo." });
    }

    // Restar la apuesta del XP total del usuario
    user.xp_total -= betAmount;
    await user.save();

    // Actualizar el participante
    participant.status = "accepted";
    participant.bet_amount = betAmount;
    await participant.save();

    // Verificar si todos los participantes han aceptado
    const pendingParticipants = await TournamentParticipant.count({
      where: {
        tournament_id,
        status: "pending",
      },
    });

    if (pendingParticipants === 0) {
      // Activar el torneo
      tournament.status = "active";
      await tournament.save();
    }

    res.status(200).send({ message: "Has aceptado la invitación al torneo." });
  } catch (error) {
    console.error("Error al aceptar la invitación:", error);
    res.status(500).send({
      message: "Error al aceptar la invitación",
      error: error.message,
    });
  }
};

exports.rejectTournamentInvitation = async (req, res) => {
  const { user_id, tournament_id } = req.body;

  try {
    const participant = await TournamentParticipant.findOne({
      where: { tournament_id, user_id },
    });

    if (!participant || participant.status !== "pending") {
      return res.status(400).send({ message: "Invitación inválida." });
    }

    participant.status = "rejected";
    await participant.save();

    res.status(200).send({ message: "Has rechazado la invitación al torneo." });
  } catch (error) {
    console.error("Error al rechazar la invitación:", error);
    res.status(500).send({
      message: "Error al rechazar la invitación",
      error: error.message,
    });
  }
};

exports.updateTournamentXp = async (user_id, xp_gained) => {
  try {
    const activeParticipants = await TournamentParticipant.findAll({
      where: {
        user_id,
        status: "accepted",
      },
      include: [
        {
          model: Tournament,
          where: {
            status: "active",
            start_date: { [Op.lte]: new Date() },
            end_date: { [Op.gte]: new Date() },
          },
        },
      ],
    });

    for (const participant of activeParticipants) {
      participant.xp_accumulated = Number(participant.xp_accumulated) || 0;
      participant.xp_accumulated += xp_gained;
      await participant.save();
    }
  } catch (error) {
    console.error("Error al actualizar XP del torneo:", error);
  }
};

exports.endTournaments = async () => {
  try {
    const now = new Date();
    const tournaments = await Tournament.findAll({
      where: {
        status: "active",
        end_date: { [Op.lte]: now },
      },
    });

    for (const tournament of tournaments) {
      const participants = await TournamentParticipant.findAll({
        where: { tournament_id: tournament.id_tournament, status: "accepted" },
        include: [Usuarios],
      });

      const totalPool = participants.reduce((sum, p) => sum + p.bet_amount, 0);

      // Obtener el máximo de XP acumulado
      const maxXp = Math.max(
        ...participants.map((p) => Number(p.xp_accumulated))
      );
      console.log(`maxXp: ${maxXp}`);

      // Identificar a los ganadores
      const winners = participants.filter(
        (p) => Number(p.xp_accumulated) === maxXp
      );

      // Calcular las ganancias por ganador
      const winningsPerWinner = Math.floor(totalPool / winners.length);

      // Verificar si todos los participantes empataron
      const isTie = winners.length === participants.length;

      for (const participant of participants) {
        let result;
        let message;
        console.log(
          `Procesando participante ID: ${participant.user_id}, XP acumulado: ${participant.xp_accumulated}`
        );
        if (isTie) {
          // Todos empataron
          result = "draw";
          message = `El torneo #${tournament.id_tournament} ha finalizado en empate.`;

          // Devolver la apuesta original a cada participante
          participant.Usuario.xp_total += participant.bet_amount;
          await participant.Usuario.save();

          // No se otorgan premios adicionales en caso de empate total
        } else if (
          winners.some(
            (winner) => Number(winner.user_id) === Number(participant.user_id)
          )
        ) {
          // El participante es uno de los ganadores
          result = "win";
          message = `¡Felicidades! Ganaste el torneo #${tournament.id_tournament}.`;
          console.log(`Participante ${participant.user_id} ha ganado.`);

          // Otorgar las ganancias al ganador
          participant.Usuario.xp_total += winningsPerWinner;
          await participant.Usuario.save();

          // Verificar si el usuario subió de nivel
          await checkForLevelUp(participant.Usuario);
        } else {
          // El participante perdió
          result = "lose";
          message = `El torneo #${tournament.id_tournament} ha finalizado. Has perdido.`;
          console.log(`Participante ${participant.user_id} ha perdido.`);
          // No se realiza ninguna acción adicional
        }

        // Enviar notificación al participante
        await notificationController.createNotification(
          participant.user_id,
          "tournament_result",
          message,
          { tournamentId: tournament.id_tournament, result }
        );
      }

      // Actualizar el estado del torneo a "completed"
      tournament.status = "completed";
      await tournament.save();
      console.log(`Torneo ${tournament.id_tournament} finalizado.`);
    }
  } catch (error) {
    console.error("Error al finalizar torneos:", error);
  }
};

// Obtener el torneo activo del usuario
exports.getActiveTournament = async (req, res) => {
  const { userId } = req.params;

  try {
    const participant = await TournamentParticipant.findOne({
      where: {
        user_id: userId,
        status: "accepted",
      },
      include: [
        {
          model: Tournament,
          where: {
            status: {
              [Op.in]: ["active", "pending"],
            },
          },
          include: [
            {
              model: Usuarios,
              as: "creator",
              attributes: ["id_usuario", "username", "uid_avatar"],
              include: [
                {
                  model: Avatares,
                  as: "avatar",
                  attributes: ["avatar"],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!participant) {
      return res.status(404).send({ message: "No tienes torneos activos." });
    }

    // Obtener todos los participantes del torneo
    const participants = await TournamentParticipant.findAll({
      where: {
        tournament_id: participant.tournament_id,
        status: "accepted",
      },
      include: [
        {
          model: Usuarios,
          attributes: ["id_usuario", "username", "uid_avatar"],
          include: [
            {
              model: Avatares,
              as: "avatar",
              attributes: ["avatar"],
            },
          ],
        },
      ],
    });

    res.status(200).send({
      tournament: participant.Tournament,
      participants: participants.map((p) => ({
        id_usuario: p.Usuario.id_usuario,
        username: p.Usuario.username,
        avatar: p.Usuario.avatar ? p.Usuario.avatar.avatar : null,
      })),
    });
  } catch (error) {
    console.error("Error al obtener el torneo activo:", error);
    res.status(500).send({
      message: "Error al obtener el torneo activo",
      error: error.message,
    });
  }
};

exports.getTournamentInvitations = async (req, res) => {
  const { userId } = req.params;

  try {
    const invitations = await TournamentParticipant.findAll({
      where: {
        user_id: userId,
        status: "pending",
      },
      include: [
        {
          model: Tournament,
          include: [
            {
              model: Usuarios,
              as: "creator",
              attributes: ["username", "uid_avatar"],
              include: [
                {
                  model: Avatares,
                  as: "avatar",
                  attributes: ["avatar"],
                },
              ],
            },
          ],
        },
      ],
    });

    res.status(200).json(
      invitations.map((inv) => ({
        tournament_id: inv.tournament_id,
        creatorUsername: inv.Tournament.creator.username,
        creatorAvatar: inv.Tournament.creator.avatar
          ? inv.Tournament.creator.avatar.avatar
          : null,
        bet_amount: inv.Tournament.bet_amount,
      }))
    );
  } catch (error) {
    console.error("Error al obtener invitaciones de torneo:", error);
    res.status(500).send({
      message: "Error al obtener invitaciones de torneo",
      error: error.message,
    });
  }
};
