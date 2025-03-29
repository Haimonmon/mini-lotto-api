import { Router } from "express";
import BetController from "../../controllers/v1/betController.js";

import authorization from "../../middlewares/authorization.js";
import authentication from "../../middlewares/authentication.js";

const betRouter = new Router();
const bet = new BetController();
betRouter.use(authorization);

/**
 * Place a bet
 * @method POST
 * @path /bets/
 */
betRouter.post("/", authentication, bet.placeBet.bind(bet));

/**
 * Process bets (Check winners, update pot)
 * @method POST
 * @path /bets/process
 */
betRouter.post("/process", authentication, bet.processBets.bind(bet));


betRouter.get("/latestBets", authentication, bet.getLatestBets.bind(bet));

betRouter.get("/getBetsUser", authentication, bet.getuserbetsround.bind(bet));

export default betRouter;