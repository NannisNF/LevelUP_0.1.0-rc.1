// controllers/likeController.cjs
const Sequelize = require("sequelize");
const {
  Publicacion,
  Usuarios,
  Avatares,
  Likes,
  Amistad,
} = require("../models/index.cjs");
const { Op } = Sequelize;

// Dar Like a una Publicación
const likePost = async (req, res) => {
  const { userId, postId } = req.body;

  try {
    // Verificar si la publicación existe
    const post = await Publicacion.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: "Publicación no encontrada" });
    }

    // Verificar si el usuario es amigo del autor de la publicación
    const isFriend = await Amistad.findOne({
      where: {
        friend_status: "accepted",
        [Op.or]: [
          { id_user1: userId, id_user2: post.uid_post },
          { id_user1: post.uid_post, id_user2: userId },
        ],
      },
    });

    if (!isFriend && userId !== post.uid_post) {
      return res.status(403).json({
        message: "No puedes dar like a esta publicación",
      });
    }

    // Verificar si ya dio like
    const existingLike = await Likes.findOne({
      where: {
        id_publicacion: postId,
        id_usuario: userId,
      },
    });

    if (existingLike) {
      return res
        .status(400)
        .json({ message: "Ya has dado like a esta publicación" });
    }

    // Crear el like
    await Likes.create({
      id_publicacion: postId,
      id_usuario: userId,
    });

    res.status(201).json({ message: "Like agregado" });
  } catch (error) {
    console.error("Error al dar like:", error);
    res.status(500).json({ message: "Error al dar like" });
  }
};

// Quitar Like de una Publicación
const unlikePost = async (req, res) => {
  const { userId, postId } = req.body;

  try {
    const like = await Likes.findOne({
      where: {
        id_publicacion: postId,
        id_usuario: userId,
      },
    });

    if (!like) {
      return res
        .status(404)
        .json({ message: "No has dado like a esta publicación" });
    }

    await like.destroy();

    res.status(200).json({ message: "Like eliminado" });
  } catch (error) {
    console.error("Error al quitar like:", error);
    res.status(500).json({ message: "Error al quitar like" });
  }
};

// Obtener el número de likes de una publicación
const getLikesCount = async (req, res) => {
  const { postId } = req.params;

  try {
    const likesCount = await Likes.count({
      where: { id_publicacion: postId },
    });

    res.status(200).json({ likes: likesCount });
  } catch (error) {
    console.error("Error al obtener el conteo de likes:", error);
    res.status(500).json({ message: "Error al obtener el conteo de likes" });
  }
};

// Verificar si un usuario ha dado like a una publicación
const hasLikedPost = async (req, res) => {
  const { userId, postId } = req.params;

  try {
    const like = await Likes.findOne({
      where: {
        id_publicacion: postId,
        id_usuario: userId,
      },
    });

    res.status(200).json({ hasLiked: !!like });
  } catch (error) {
    console.error("Error al verificar si ha dado like:", error);
    res.status(500).json({ message: "Error al verificar si ha dado like" });
  }
};

module.exports = {
  likePost,
  unlikePost,
  getLikesCount,
  hasLikedPost,
};
