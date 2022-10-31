import 'reflect-metadata';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';

import { Request, Response } from 'express';
import handleErrorMiddleware from './middlewares/handleError.middleware';
import { appRoutes } from './routes';

const app = express();
app.use(cors());

app.use(express.json());

appRoutes(app);

app.use(handleErrorMiddleware);

app.get('/', (req: Request, res: Response) => {
	return res.json({ message: 'Hello World!' });
});

export default app;
