import { Router } from 'express';
import accountRouter from './accountRoutes.js';
import potRouter from './potRoutes.js';
import betRouter from './betRoutes.js';
import drawRouter from './drawRoutes.js';
import notificationRouter from './notificationRoutes.js';

const v1 = new Router();

// path /v1/draw/
v1.use('/draw', drawRouter);

// path /v1/bets/
v1.use('/bets', betRouter);

// path /v1/pot/
v1.use('/pot', potRouter);

// path /v1/account/
v1.use('/account', accountRouter);

// path /v1/notification/
v1.use('/notification', notificationRouter);

export default v1;