import { Router } from "express";
import PotController from "../../controllers/v1/potController.js";

import authorization from "../../middlewares/authorization.js";
import authentication from "../../middlewares/authentication.js";

const potRouter = new Router();
const pot = new PotController();
potRouter.use(authorization);

/**
 * Get the current pot amount
 * @method GET
 * @path /v1/pot/
 */
potRouter.get("/", pot.getPot.bind(pot));

/**
 * Update the pot amount
 * @method PATCH
 * @path /v1/pot/
 */
potRouter.patch("/", authentication, pot.updatePot.bind(pot));

/**
 * Roll over the pot if there is no winner
 * @method PATCH
 * @path /v1/pot/rollover
 */
potRouter.patch("/rollover", authentication, pot.rollOverPot.bind(pot));

export default potRouter;