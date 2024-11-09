// db.cjs
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  "railway",
  "root",
  "dTlOIKmwzyFTvuYCnutyMaEyfIThkjMy",
  {
    host: "autorack.proxy.rlwy.net",
    port: 27588,
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
