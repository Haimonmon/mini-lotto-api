import { connection } from "../core/database.js";

class Notification {
    constructor() {
        this.db = connection;
    }

    /**
     * Add a new notification
     * @param {number} user_id - The user who will receive the notification
     * @param {"won" | "lost" | "wallet-add" | "wallet-deduct"} type - Notification type
     * @param {string} message - Notification message
     */
    async addNotification(user_id, type, message) {
        try {
            // Validate notification type
            const validTypes = ["round_won", "round_lost", "wallet_add", "wallet_deduct"];
            if (!validTypes.includes(type)) {
                throw new Error(`Invalid notification type: ${type}`);
            }

            // Insert notification into the database
            const [result] = await this.db.execute(
                "INSERT INTO notification (user_id, notification_type, notification_message, created_at) VALUES (?, ?, ?, NOW())",
                [user_id, type, message]
            );

            return result;
        } catch (err) {
            console.error("<error> Notification.addNotification", err);
            throw err;
        }
    }

    /**
     * Get all notifications for a user
     * @param {number} user_id - The user ID
     * @returns {Array} List of notifications
     */
    async getUserNotifications(user_id) {
        try {
            const [notifications] = await this.db.execute(
                "SELECT * FROM notification WHERE user_id = ? ORDER BY created_at DESC",
                [user_id]
            );
            return notifications;
        } catch (err) {
            console.error("<error> Notification.getUserNotifications", err);
            throw err;
        }
    }

    /**
     * Get the latest notifications for a user
     * @param {number} user_id - The user ID
     * @param {number} [limit=10] - Number of notifications to fetch
     * @returns {Array} List of latest notifications
     */
    async getLatestNotifications(user_id, limit = 10) {
        try {
            const [notifications] = await this.db.execute(
                "SELECT * FROM notification WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
                [user_id, limit]
            );
            return notifications;
        } catch (err) {
            console.error("<error> Notification.getLatestNotifications", err);
            throw err;
        }
    }
}

export default Notification;
