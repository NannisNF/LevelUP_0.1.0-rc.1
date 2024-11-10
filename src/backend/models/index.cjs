// models/index.cjs
const Usuarios = require("./Usuarios.cjs");
const Publicacion = require("./Publicacion.cjs");
const Likes = require("./Likes.cjs");
const Avatares = require("./Avatares.cjs");
const Amistad = require("./Amistad.cjs");

Publicacion.belongsTo(Usuarios, { foreignKey: "uid_post", as: "user" });
Publicacion.hasMany(Likes, { foreignKey: "id_publicacion", as: "likes" });
Likes.belongsTo(Usuarios, { foreignKey: "id_usuario", as: "user" });
Likes.belongsTo(Publicacion, { foreignKey: "id_publicacion", as: "post" });
Usuarios.hasMany(Likes, { foreignKey: "id_usuario", as: "likes" });

module.exports = {
  Usuarios,
  Publicacion,
  Likes,
  Avatares,
  Amistad,
};
