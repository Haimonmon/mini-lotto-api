import { Router } from "express";

import AccountController from "../../controllers/v1/accountControllers.js";

import authorization from "../../middlewares/authorization.js";
import authentication from "../../middlewares/authentication.js";

const accountRouter = new Router();
const account = new AccountController();

accountRouter.use(authorization);

/**
 * create account
 * @method POST
 * path /v1/account/
 */
accountRouter.post('/', account.create.bind(account));

/**
 * account login
 * @method POST
 * path /v1/account/login
 */
accountRouter.post('/login', account.login.bind(account));

/**
 * view profile
 * @method GET
 * path /v1/account/profile
 */
accountRouter.get('/profile', authentication, account.profile.bind(account));

/**
 * update password
 * @method PATCH
 * path /v1/account/
 */
accountRouter.patch('/', authentication, account.updatePassword.bind(account));

/**
 * user topUp
 * @method POST
 * path /v1/account/topup/
 */
accountRouter.patch('/topup', authentication, account.addMoney.bind(account));

/**
 * bet history
 * @method get
 * path /v1/account/history
 */
accountRouter.get('/history', authentication, account.getBetHistory.bind(account));

/**
 * last-win-history
 * @method GET
 * path /v1/account/win-history
 */
accountRouter.get('/lastwin', authentication, account.getLastWinHistoria.bind(account));

export default accountRouter;