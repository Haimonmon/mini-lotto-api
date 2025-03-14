import Notification from "../models/notification.js";

class NotificationController {
    /**
     * Fetch notifications for a user
     */
    async getNotifications(req, res) {
        try {
            const  userId  = res.locals.user_id;
            const notifications = await Notification.getUserNotifications(userId);
            res.status(201).send({
                success: true,
                data: {
                    notifications
                }
            });
        } catch (err) {
            console.error("Error in NotificationController.getNotifications", err);
            res.status(500).send({
                success: false,
                message: err.toString()
            });
        }
    }

    /**
     * Create a new notification
     */
    async createNotification(req, res) {
        try {
            const { notification_type, notification_message } = req.body;
            const userId = res.locals.user_id;

            if (!notification_type || !notification_message) {
                return res.status(400).send({ 
                    error: "Missing required fields" 
                });
            }

            await Notification.createNotification(user_id, notification_type, notification_message);
            res.status(201).send({ 
                success: true,
                message: "Notification created successfully" 
            });
        } catch (err) {
            console.error("Error in NotificationController.createNotification", err);
            res.status(500).send({ 
                success:false,
                message: err.toString() 
            });
        }
    }
}

export default new NotificationController();
