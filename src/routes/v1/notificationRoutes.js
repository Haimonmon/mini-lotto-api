import { Router } from "express";

import NotificationController from "../../controllers/v1/notificationController.js";
import authorization from "../../middlewares/authorization.js";
import authentication from "../../middlewares/authentication.js";

const notificationRouter = new Router();
const notification = new NotificationController();

notificationRouter.use(authorization);

/**
 * Get Notification
 * @method GET
 * path /v1/notification/
 */
notificationRouter.get('/', authentication, notification.getNotifications.bind(notification));

export default notificationRouter;