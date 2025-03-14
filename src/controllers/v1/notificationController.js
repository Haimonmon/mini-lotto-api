import Notification from "../../models/notification.js";

class NotificationController {
    constructor(){
        this.Notification = new Notification();
    }
    /**
     * Fetch notifications for a user
     */
    async getNotifications(req, res) {
        try {
            const  userId  = res.locals.user_id;
            const notifications = await this.Notification.getUserNotifications(userId);
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
}

export default NotificationController;
