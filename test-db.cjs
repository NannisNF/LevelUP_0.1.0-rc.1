const { Sequelize } = require("sequelize");

// Conectar con la base de datos
const sequelize = new Sequelize("level_up_db", "root", "Sinnala02032000", {
  host: "localhost",
  dialect: "mysql",
});

// Probar la conexión
sequelize
  .authenticate()
  .then(() => {
    console.log("Conexión establecida exitosamente.");
  })
  .catch((err) => {
    console.error("No se pudo conectar a la base de datos:", err);
  })
  .finally(() => {
    sequelize.close(); // Cierra la conexión después de la prueba
  });

module.exports = sequelize;
