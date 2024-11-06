// db.cjs
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  "railway",
  "root",
  "cpcSBYpOGxOSUvmVzboADQjjVqTYFrWw",
  {
    host: "junction.proxy.rlwy.net",
    port: 56567,
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
