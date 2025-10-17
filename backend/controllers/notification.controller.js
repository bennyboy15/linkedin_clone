import Notification from "../models/notification.model.js";

export async function getUserNotifications(req, res) {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .populate("relatedUser", "name username profilePicture")
      .populate("relatedPost", "content image");

    res.status(200).json(notifications);
  } catch (error) {
    console.log(
      "Error in getUserNotifications notification controller:",
      error.message
    );
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

export async function markNotificationAsRead(req, res) {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      { _id: id, recipient: req.user._id }, // Find by
      { read: true }, // Update fields
      { new: true } // Return the newly updated object
    );

    res.status(200).json(notification);
  } catch (error) {
    console.log(
      "Error in markNotificationAsRead notification controller:",
      error.message
    );
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

export async function deleteNotification(req, res) {
  try {
    const { id } = req.params;

    await Notification.findOneAndDelete(
      { _id: id, recipient: req.user._id }, // Find by
    );

    res.status(200).json({message: "Notification deleted successfully"});
  } catch (error) {
    console.log("Error in markNotificationAsRead notification controller:",error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}
