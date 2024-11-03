// db.cjs
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  "nombre_base_de_datos",
  "usuario",
  "contraseña",
  {
    host: "nombre_host",
    port: 3306, // O el puerto proporcionado por Railway
    dialect: "mysql",
  }
);

sequelize
  .authenticate()
  .then(() => {
    console.log("Conexión a la base de datos exitosa.");
  })
  .catch((err) => {
    console.error("Error al conectar a la base de datos:", err);
  });

module.exports = sequelize;
