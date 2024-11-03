//habitController.cjs
const Habitos = require("../models/Habitos.cjs");
const Clase = require("../models/Clase.cjs");
const HabitosPredeterminados = require("../models/HabitosPredeterminados.cjs");
const Amistad = require("../models/Amistad.cjs");
const Sequelize = require("sequelize");

const getHabitsByUserId = async (req, res) => {
  const { userId } = req.params;
  try {
    const habits = await Habitos.findAll({
      where: { habit_uid: userId },
      include: [
        {
          model: Clase,
          as: "clase",
          attributes: ["nameclase", "claseurl"],
        },
      ],
    });

    if (habits.length === 0) {
      return res
        .status(404)
        .send({ message: "No habits found for this user." });
    }

    const habitsWithImages = habits.map((habit) => {
      const imageUrl = habit.clase
        ? `${req.protocol}://${req.get("host")}/img/classes/${
            habit.clase.claseurl
          }`
        : null;
      console.log("Image URL:", imageUrl);
      return {
        ...habit.get({ plain: true }),
        image: imageUrl,
      };
    });

    res.status(200).json(habitsWithImages);
  } catch (error) {
    console.error("Error fetching habits by user ID:", error);
    res.status(500).send({ message: "Error fetching habits." });
  }
};

const addHabit = async (req, res) => {
  const {
    habit_uid,
    titulo,
    descripcion,
    inicio_habit,
    fin_habit,
    xp_habito,
    clase_habit,
  } = req.body;
  try {
    const newHabit = await Habitos.create({
      habit_uid,
      titulo,
      descripcion,
      inicio_habit,
      fin_habit,
      xp_habito,
      clase_habit,
      status_habito: "En progreso", // Valor por defecto, lo pongo 2 veces por precacución
    });

    res.status(201).json(newHabit);
  } catch (error) {
    console.error("Error adding new habit:", error);
    res.status(500).send({ message: "Failed to add new habit." });
  }
};

const getHabitRecommendations = async (req, res) => {
  const { userId } = req.params;
  try {
    // Obtener las clases de los hábitos del usuario
    const userHabits = await Habitos.findAll({
      where: {
        habit_uid: userId,
      },
      attributes: ["clase_habit"],
    });

    // Obtener las amistades aceptadas del usuario
    const friendships = await Amistad.findAll({
      where: {
        [Sequelize.Op.or]: [
          { id_user1: userId, friend_status: "accepted" },
          { id_user2: userId, friend_status: "accepted" },
        ],
      },
    });

    // Extraer los IDs de los amigos
    const friendIds = friendships.map((f) => {
      return f.id_user1 === parseInt(userId) ? f.id_user2 : f.id_user1;
    });

    // Obtener las clases de los hábitos de los amigos
    const friendsHabits = await Habitos.findAll({
      where: {
        habit_uid: friendIds,
      },
      attributes: ["clase_habit"],
    });

    // Combinar las clases de hábitos del usuario y de los amigos
    const allClasses = [...userHabits, ...friendsHabits].map(
      (h) => h.clase_habit
    );

    // Contar la frecuencia de cada clase
    const classCounts = {};
    allClasses.forEach((cls) => {
      classCounts[cls] = (classCounts[cls] || 0) + 1;
    });

    // Ordenar las clases por frecuencia
    const sortedClasses = Object.entries(classCounts).sort(
      (a, b) => b[1] - a[1]
    );

    // Obtener las clases más frecuentes (por ejemplo, las dos primeras)
    const topClasses = sortedClasses.slice(0, 2).map((entry) => entry[0]);

    // Obtener hábitos predeterminados que coincidan con las clases más frecuentes
    const recommendedHabits = await HabitosPredeterminados.findAll({
      where: {
        clase_pred_habit: topClasses,
      },
    });

    res.status(200).json(recommendedHabits);
  } catch (error) {
    console.error("Error fetching habit recommendations:", error);
    res
      .status(500)
      .send({ message: "Error al obtener las recomendaciones de hábitos." });
  }
};

exports.getHabitsByUserId = getHabitsByUserId;
exports.addHabit = addHabit;
exports.getHabitRecommendations = getHabitRecommendations;
