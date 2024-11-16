// friendController.cjs
const Amistad = require("../models/Amistad.cjs");
const Usuarios = require("../models/Usuarios.cjs");
const Sequelize = require("sequelize");
const Avatares = require("../models/Avatares.cjs");
const TournamentParticipant = require("../models/TournamentParticipant.cjs");
const Tournament = require("../models/Tournament.cjs");
const { Op } = Sequelize;

const sendFriendRequest = async (req, res) => {
  const { id_user1, id_user2 } = req.body;
  try {
    // Verificar si ya existe una amistad entre los dos usuarios
    const existingFriendship = await Amistad.findOne({
      where: {
        [Sequelize.Op.or]: [
          { id_user1, id_user2 },
          { id_user1: id_user2, id_user2: id_user1 },
        ],
      },
    });

    if (existingFriendship) {
      return res.status(400).send({
        message: "La solicitud de amistad ya existe o está pendiente",
      });
    }

    const newFriendship = await Amistad.create({
      id_user1,
      id_user2,
      friend_status: "pending",
    });
    return res.status(201).json({ message: "Solicitud enviada exitosamente" });
  } catch (error) {
    return res.status(500).json({
      message: "Error al enviar la solicitud de amistad",
      error: error.message,
    });
  }
};

const acceptFriendRequest = async (req, res) => {
  const { id_user1, id_user2 } = req.body;
  try {
    const friendship = await Amistad.findOne({
      where: {
        id_user1: id_user1, // ID del solicitante
        id_user2: id_user2, // Tu ID (receptor)
        friend_status: "pending",
      },
    });

    if (friendship) {
      await friendship.update({ friend_status: "accepted" });
      res.status(200).send(friendship);
    } else {
      res.status(404).send({
        message: "Solicitud de amistad no encontrada o ya procesada",
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "Error al aceptar la solicitud de amistad",
      error: error.message,
    });
  }
};

const rejectFriendRequest = async (req, res) => {
  const { id_user1, id_user2 } = req.body;
  try {
    const friendship = await Amistad.findOne({
      where: {
        id_user1: id_user1, // ID del solicitante
        id_user2: id_user2, // Tu ID (receptor)
        friend_status: "pending",
      },
    });

    if (friendship) {
      await friendship.update({ friend_status: "rejected" });
      res.status(200).send(friendship);
    } else {
      res.status(404).send({
        message: "Solicitud de amistad no encontrada o ya procesada",
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "Error al rechazar la solicitud de amistad",
      error: error.message,
    });
  }
};

const getFriendRequests = async (req, res) => {
  const { userId } = req.params;
  try {
    const requests = await Amistad.findAll({
      where: {
        id_user2: userId,
        friend_status: "pending",
      },
      include: [
        {
          model: Usuarios,
          as: "Sender",
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

    const formattedRequests = requests.map((req) => ({
      id_amistad: req.id_amistad,
      senderId: req.Sender.id_usuario,
      senderUsername: req.Sender.username,
      senderAvatar: req.Sender.avatar ? req.Sender.avatar.avatar : null,
    }));

    res.status(200).json(formattedRequests);
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    res.status(500).json({ message: "Error fetching friend requests" });
  }
};

const checkFriendshipStatus = async (req, res) => {
  const myId = parseInt(req.params.myId, 10);
  const otherUserId = parseInt(req.params.otherUserId, 10);
  try {
    const friendship = await Amistad.findOne({
      where: {
        [Sequelize.Op.or]: [
          { id_user1: myId, id_user2: otherUserId },
          { id_user1: otherUserId, id_user2: myId },
        ],
      },
    });
    if (friendship) {
      console.log(
        `friendship.id_user2: ${
          friendship.id_user2
        } (type: ${typeof friendship.id_user2})`
      );
      console.log(`myId: ${myId} (type: ${typeof myId})`);
      const isReceiver = friendship.id_user2 === myId;
      res.json({ status: friendship.friend_status, isReceiver });
    } else {
      res.json({ status: "none" });
    }
  } catch (error) {
    console.error("Error checking friendship status", error);
    res
      .status(500)
      .send({ message: "Error al verificar el estado de amistad" });
  }
};

const searchFriends = async (req, res) => {
  const { userId } = req.params;
  const { name } = req.query;

  try {
    // Obtener las amistades aceptadas del usuario
    const friendships = await Amistad.findAll({
      where: {
        [Op.or]: [
          { id_user1: userId, friend_status: "accepted" },
          { id_user2: userId, friend_status: "accepted" },
        ],
      },
    });

    // Extraer los IDs de los amigos
    const friendIds = friendships.map((f) => {
      return f.id_user1 === parseInt(userId) ? f.id_user2 : f.id_user1;
    });

    if (friendIds.length === 0) {
      return res.status(200).json([]);
    }

    // Buscar entre los amigos cuyos usernames coincidan con el termino de busqueda
    const friends = await Usuarios.findAll({
      where: {
        id_usuario: friendIds,
        username: {
          [Op.like]: `%${name}%`,
        },
      },
      attributes: ["id_usuario", "username"],
      include: [
        {
          model: Avatares,
          as: "avatar",
          attributes: ["avatar"],
        },
      ],
    });

    res.status(200).json(friends);
  } catch (error) {
    console.error("Error al buscar entre los amigos:", error);
    res.status(500).send({
      message: "Error al buscar entre los amigos",
      error: error.message,
    });
  }
};

// Endpoint para buscar amigos excluyendo aquellos en torneos activos
const searchFriendsNotInActiveTournament = async (req, res) => {
  const { userId, name } = req.params;

  try {
    // Obtener los amigos aceptados
    const friends = await Amistad.findAll({
      where: {
        [Op.or]: [{ id_user1: userId }, { id_user2: userId }],
        friend_status: "accepted",
      },
    });

    const friendIds = friends.map((friend) =>
      friend.id_user1 === parseInt(userId) ? friend.id_user2 : friend.id_user1
    );

    // Excluir amigos que están en un torneo activo
    const participantsInActiveTournament = await TournamentParticipant.findAll({
      where: {
        user_id: { [Op.in]: friendIds },
        status: "accepted",
      },
      include: [
        {
          model: Tournament,
          where: {
            status: "active",
          },
        },
      ],
    });

    const friendIdsInActiveTournament = participantsInActiveTournament.map(
      (participant) => participant.user_id
    );

    // Obtener amigos que no están en un torneo activo y que coinciden con el nombre buscado
    const availableFriends = await Usuarios.findAll({
      where: {
        id_usuario: {
          [Op.in]: friendIds.filter(
            (id) => !friendIdsInActiveTournament.includes(id)
          ),
        },
        username: {
          [Op.like]: `%${name}%`,
        },
      },
      include: [
        {
          model: Avatares,
          as: "avatar",
          attributes: ["avatar"],
        },
      ],
    });

    res.status(200).send(availableFriends);
  } catch (error) {
    console.error("Error al buscar amigos:", error);
    res.status(500).send({
      message: "Error al buscar amigos",
      error: error.message,
    });
  }
};

const getFriendsList = async (req, res) => {
  const { userId } = req.params;
  try {
    // Obtener las amistades aceptadas del usuario
    const friendships = await Amistad.findAll({
      where: {
        [Op.or]: [
          { id_user1: userId, friend_status: "accepted" },
          { id_user2: userId, friend_status: "accepted" },
        ],
      },
      include: [
        {
          model: Usuarios,
          as: "Sender",
          attributes: ["id_usuario", "username"],
          include: [
            {
              model: Avatares,
              as: "avatar",
              attributes: ["avatar"],
            },
          ],
        },
        {
          model: Usuarios,
          as: "Receiver",
          attributes: ["id_usuario", "username"],
          required: false,
          include: [
            {
              model: Avatares,
              as: "avatar",
              attributes: ["avatar"],
              required: false,
            },
          ],
        },
      ],
    });

    // Construir una lista de amigos excluyendo al usuario actual
    const friends = friendships.map((friendship) => {
      const friend =
        friendship.id_user1 === parseInt(userId)
          ? friendship.Receiver
          : friendship.Sender;
      return {
        id_usuario: friend.id_usuario,
        username: friend.username,
        avatar: friend.avatar ? friend.avatar.avatar : null,
      };
    });

    res.status(200).json(friends);
  } catch (error) {
    console.error("Error al obtener la lista de amigos:", error);
    res.status(500).send({
      message: "Error al obtener la lista de amigos",
      error: error.message,
    });
  }
};

const deleteFriendship = async (req, res) => {
  const { userId, friendId } = req.body;
  try {
    const friendship = await Amistad.findOne({
      where: {
        [Op.or]: [
          { id_user1: userId, id_user2: friendId },
          { id_user1: friendId, id_user2: userId },
        ],
        friend_status: "accepted",
      },
    });

    if (friendship) {
      await friendship.destroy();
      res.status(200).send({ message: "Amistad eliminada exitosamente" });
    } else {
      res.status(404).send({ message: "Amistad no encontrada" });
    }
  } catch (error) {
    console.error("Error al eliminar la amistad:", error);
    res.status(500).send({
      message: "Error al eliminar la amistad",
      error: error.message,
    });
  }
};

module.exports = {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriendRequests,
  checkFriendshipStatus,
  searchFriends,
  searchFriendsNotInActiveTournament,
  getFriendsList,
  deleteFriendship,
};
