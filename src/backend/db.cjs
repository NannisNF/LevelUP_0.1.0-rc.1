//db.cjs
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("level_up_db", "root", "Sinnala02032000", {
  host: "localhost",
  dialect: "mysql",
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Conexión a la base de datos exitosa.");
  })
  .catch((err) => {
    console.error("Error al conectar a la base de datos:", err);
  });

module.exports = sequelize;
