// postController.cjs
const Sequelize = require("sequelize");
const { Op } = Sequelize; // Importación de Op
const multer = require("multer");
const path = require("path");
const { calcularNivelUsuario, checkForLevelUp } = require("../nivelUtils.cjs");
const {
  Publicacion,
  Usuarios,
  Avatares,
  Likes,
  Amistad,
} = require("../models/index.cjs");

// Configuración de Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Guarda el archivo con un timestamp para evitar nombres duplicados
  },
});

const upload = multer({ storage: storage });

// Crear una nueva publicación
const createPost = async (req, res) => {
  const { uid_post, post_hid, cont_text } = req.body;
  const cont_media = req.file
    ? `http://localhost:3000/uploads/${req.file.filename}`
    : null;

  try {
    // Obtener la fecha actual sin tiempo
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Verificar si el usuario ya ha hecho una publicación para este hábito hoy
    const existingPosts = await Publicacion.count({
      where: {
        uid_post: uid_post,
        post_hid: post_hid,
        post_date: {
          [Op.gte]: today,
          [Op.lt]: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    const shouldAwardXp = existingPosts === 0;

    // Crear la publicación
    const newPost = await Publicacion.create({
      uid_post,
      post_hid,
      cont_text,
      cont_media,
      post_date: new Date(),
    });

    // Si el usuario no ha ganado XP para este hábito hoy, otorgar 50 XP
    if (shouldAwardXp) {
      const user = await Usuarios.findByPk(uid_post);
      if (user) {
        user.xp_total = (user.xp_total || 0) + 50;
        user.xp_semanal = (user.xp_semanal || 0) + 50;
        await user.save();
        await checkForLevelUp(user);
      }
    }

    res.status(201).json(newPost);
  } catch (error) {
    console.error("Error creando una nueva publicación:", error);
    res.status(500).send({ message: "No se pudo crear la nueva publicación." });
  }
};

const getPosts = async (req, res) => {
  try {
    const posts = await Publicacion.findAll(); // Usando Sequelize para obtener todos los posts
    res.json(posts);
  } catch (error) {
    console.error("Error getting posts:", error);
    res.status(500).send({ message: "Failed to get posts." });
  }
};

const getPostsByUserId = async (req, res) => {
  const { userId } = req.params;
  try {
    const posts = await Publicacion.findAll({
      where: { uid_post: userId },
    });
    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Error fetching posts", error });
  }
};

const getPostsFromFriends = async (req, res) => {
  const { userId } = req.params;

  try {
    const myId = parseInt(userId, 10);

    // Obtener las amistades aceptadas
    const friendships = await Amistad.findAll({
      where: {
        friend_status: "accepted",
        [Op.or]: [{ id_user1: myId }, { id_user2: myId }],
      },
    });

    // Obtener los IDs de los amigos
    const friendIds = friendships.map((friendship) => {
      return friendship.id_user1 === myId
        ? friendship.id_user2
        : friendship.id_user1;
    });

    // Incluir el propio userId
    friendIds.push(myId);

    // Obtener las publicaciones de los amigos y del usuario
    const posts = await Publicacion.findAll({
      where: {
        uid_post: {
          [Op.in]: friendIds,
        },
      },
      include: [
        {
          model: Usuarios,
          as: "user",
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
          model: Likes,
          as: "likes",
          attributes: ["id_usuario"],
        },
      ],
      order: [["post_date", "DESC"]],
    });

    // Formatear los posts para incluir el conteo de likes y si el usuario ha dado like
    const formattedPosts = posts.map((post) => {
      const likesCount = post.likes.length;
      const hasLiked = post.likes.some((like) => like.id_usuario === myId);

      return {
        ...post.get({ plain: true }),
        likesCount,
        hasLiked,
      };
    });

    res.status(200).json(formattedPosts);
  } catch (error) {
    console.error("Error fetching posts from friends:", error);
    res
      .status(500)
      .json({ message: "Error al obtener las publicaciones de los amigos" });
  }
};
const getPostsByUserIdWithLikes = async (req, res) => {
  const { userId } = req.params;
  const myId = parseInt(req.query.myId, 10); // El ID del usuario que hace la solicitud

  try {
    const posts = await Publicacion.findAll({
      where: { uid_post: userId },
      include: [
        {
          model: Likes,
          as: "likes",
          attributes: ["id_usuario"],
        },
      ],
      order: [["post_date", "DESC"]],
    });

    const formattedPosts = posts.map((post) => {
      const likesCount = post.likes.length;
      const hasLiked = post.likes.some((like) => like.id_usuario === myId);

      return {
        ...post.get({ plain: true }),
        likesCount,
        hasLiked,
      };
    });

    res.status(200).json(formattedPosts);
  } catch (error) {
    console.error("Error fetching posts by user:", error);
    res.status(500).json({ message: "Error al obtener las publicaciones" });
  }
};

exports.getPostsByUserIdWithLikes = getPostsByUserIdWithLikes;
exports.getPosts = getPosts;
exports.createPost = createPost;
exports.getPostsByUserId = getPostsByUserId;
exports.getPostsFromFriends = getPostsFromFriends;
exports.upload = upload;
