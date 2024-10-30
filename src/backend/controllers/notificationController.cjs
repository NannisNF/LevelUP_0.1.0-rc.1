//notificationController.cjs
const Notification = require("../models/Notification.cjs");

exports.createNotification = async (user_id, type, message, data = null) => {
  try {
    await Notification.create({
      user_id,
      type,
      message,
      data,
    });
  } catch (error) {
    console.error("Error creando la notificación:", error);
  }
};

exports.getNotifications = async (req, res) => {
  const { userId } = req.params;
  try {
    const notifications = await Notification.findAll({
      where: { user_id: userId, read_status: false },
      order: [["created_at", "DESC"]],
    });
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error obteniendo las notificaciones:", error);
    res.status(500).send({ message: "Error obteniendo las notificaciones." });
  }
};

exports.markAsRead = async (req, res) => {
  const { notificationId } = req.params;
  try {
    const notification = await Notification.findByPk(notificationId);
    if (notification) {
      notification.read_status = true;
      await notification.save();
      res.status(200).send({ message: "Notificación marcada como leída." });
    } else {
      res.status(404).send({ message: "Notificación no encontrada." });
    }
  } catch (error) {
    console.error("Error marcando la notificación como leída:", error);
    res
      .status(500)
      .send({ message: "Error marcando la notificación como leída." });
  }
};
