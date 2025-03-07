import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import 'dotenv/config.js';
import cors from 'cors';
import morgan from 'morgan';

import v1 from './routes/v1/index.js';
import './core/database.js';;

const app = express();
const port = process.env.PORT || 8080;

app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/v1', cors(), v1);

app.listen(port, () => console.log(`Server running on port: http://localhost:${port} `));