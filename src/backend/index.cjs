//index.cjs
require("dotenv").config(); //para url de archivo env
const cron = require("node-cron");
const Habitos = require("./models/Habitos.cjs");
const Usuarios = require("./models/Usuarios.cjs");
const path = require("path");
const { Op } = require("sequelize"); // Para operadores de consulta
const express = require("express");
const Publicacion = require("./models/Publicacion.cjs");
const cors = require("cors");
const notificationController = require("./controllers/notificationController.cjs");

const registerRoutes = require("./routes/register.cjs");
const loginRoutes = require("./routes/login.cjs");
const habitRoutes = require("./routes/HabitRoutes.cjs");
const postRoutes = require("./routes/posts.cjs");
const searchRoutes = require("./routes/searchRoutes.cjs");
const userRoutes = require("./routes/userRoutes.cjs");
const friendRoutes = require("./routes/friendRoutes.cjs");
const tournamentRoutes = require("./routes/tournamentRoutes.cjs");
const tournamentController = require("./controllers/tournamentController.cjs");
const notificationRoutes = require("./routes/notificationRoutes.cjs");
const likeRoutes = require("./routes/likes.cjs");

const app = express();

const allowedOrigin = process.env.URLFRONTEND || "http://localhost:5173";

app.use(
  cors({
    origin: allowedOrigin,
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

app.use(express.json()); // Solicitudes JSON
app.use(express.static("public")); // Archivos estáticos desde la carpeta public

app.use((req, res, next) => {
  console.log(`Solicitud entrante: ${req.method} ${req.url}`);
  next();
});

// Rutas
app.use("/api/register", registerRoutes); // Rutas de registro
app.use("/api/login", loginRoutes); // Rutas de login
app.use("/api/habits", habitRoutes); // Hábitos
app.use("/api/posts", postRoutes); // Rutas de posts
app.use("/api/search", searchRoutes); // Buscador
app.use("/api/users", userRoutes); // Perfiles de otros usuarios
app.use("/api/friends", friendRoutes); // Rutas de amistad
app.use("/api/tournaments", tournamentRoutes); // Torneos
app.use("/api/notifications", notificationRoutes); //Notificaciones
app.use("/api/likes", likeRoutes); //Likes
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); //POsts
app.get("/", (req, res) => {
  res.send("¡La aplicación está funcionando correctamente!");
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error("Error no capturado:", err);
  res.status(500).send("Error interno del servidor");
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

// Tarea para actualizar el estado de los habitos
cron.schedule("0 0 * * *", async () => {
  console.log("Ejecutando actualización diaria de hábitos");
  try {
    const today = new Date().toISOString().split("T")[0]; // Fecha actual en formato YYYY-MM-DD
    console.log("Fecha actual:", today);

    // Buscar habitos que necesitan ser actualizados
    const habitsToUpdate = await Habitos.findAll({
      where: {
        fin_habit: { [Op.lte]: today },
        status_habito: "En progreso",
      },
    });

    console.log(`Hábitos a actualizar: ${habitsToUpdate.length}`);

    if (habitsToUpdate.length === 0) {
      console.log("No hay hábitos para actualizar.");
      return;
    }

    // Acumular experiencia por usuario
    const xpUpdates = {};

    for (const habit of habitsToUpdate) {
      habit.status_habito = "completado";
      await habit.save();

      await notificationController.createNotification(
        habit.habit_uid,
        "habit_completed",
        `Tu hábito "${habit.titulo}" ha sido completado.`,
        { habitId: habit.id_habito }
      );

      // Acumular xp_habito por usuario
      if (!xpUpdates[habit.habit_uid]) {
        xpUpdates[habit.habit_uid] = 0;
      }
      xpUpdates[habit.habit_uid] += habit.xp_habito || 0;
    }

    console.log("XP acumulada por usuario:", xpUpdates);

    // Actualizar xp_total y xp_semanal de los usuarios
    for (const userId in xpUpdates) {
      const user = await Usuarios.findByPk(Number(userId));
      if (user) {
        const xp_gained = xpUpdates[userId];
        user.xp_total = (user.xp_total || 0) + xp_gained;
        user.xp_semanal = (user.xp_semanal || 0) + xp_gained;
        await user.save();
        console.log(
          `Usuario ${userId} actualizado: xp_total=${user.xp_total}, xp_semanal=${user.xp_semanal}`
        );

        // Actualizar XP en torneos
        await tournamentController.updateTournamentXp(
          user.id_usuario,
          xp_gained
        );

        await checkForLevelUp(user);
      }
    }

    console.log(
      `Actualizados ${habitsToUpdate.length} hábitos a 'completado'.`
    );
  } catch (error) {
    console.error("Error durante la actualización diaria de hábitos:", error);
  }
});

// Tarea reiniciar xp_semanal
cron.schedule("0 0 * * 1", async () => {
  console.log("Reiniciando xp_semanal para todos los usuarios");
  try {
    await Usuarios.update(
      { xp_semanal: 0 },
      { where: {} } // Actualizar todos los usuarios
    );
    console.log("xp_semanal reiniciado exitosamente.");
  } catch (error) {
    console.error("Error al reiniciar xp_semanal:", error);
  }
});

// Tarea diaria de publicaciones
cron.schedule("0 0 * * *", async () => {
  console.log("Ejecutando verificación diaria de publicaciones");
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Obtener usuarios con habitos activos
    const activeHabits = await Habitos.findAll({
      where: {
        status_habito: "En progreso",
      },
      attributes: ["habit_uid"],
      group: ["habit_uid"],
    });

    const userIds = activeHabits.map((habit) => habit.habit_uid);

    // Verificar para cada usuario si ha hecho alguna publicación hoy
    for (const userId of userIds) {
      const postsToday = await Publicacion.count({
        where: {
          uid_post: userId,
          post_date: {
            [Op.gte]: today,
            [Op.lt]: new Date(today.getTime() + 24 * 60 * 60 * 1000),
          },
        },
      });

      if (postsToday === 0) {
        // El usuario no ha publico hoy, descontar 5 XP
        const user = await Usuarios.findByPk(userId);
        if (user) {
          user.xp_total = Math.max((user.xp_total || 0) - 5, 0);
          user.xp_semanal = Math.max((user.xp_semanal || 0) - 5, 0);
          await user.save();
          console.log(
            `Se descontaron 5 XP del usuario ${userId} por no publicar hoy.`
          );
        }
      } else {
        console.log(
          `El usuario ${userId} ha cumplido con la publicación diaria.`
        );
      }
    }
  } catch (error) {
    console.error(
      "Error durante la verificación diaria de publicaciones:",
      error
    );
  }
});

// Tarea para finalizar torneos "0 0 * * *"  - medianoche, */5 * * * *, cada 5 minutos, "* * * * *" - cada minuto
cron.schedule("*/5 * * * *", async () => {
  console.log("Ejecutando verificación diaria de torneos para finalizar");
  try {
    await tournamentController.endTournaments();
  } catch (error) {
    console.error("Error al ejecutar endTournaments:", error);
  }
});

module.exports = app;
