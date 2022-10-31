import { Express } from 'express';
import { petRoutes } from './pets.routes';
import { reviewsRoutes } from './reviews.routes';
import { servicesRoutes } from './services.routes';
import { userRoutes } from './user.routes';

export const appRoutes = (app: Express) => {
	app.use('/services', servicesRoutes());
	app.use('/pets', petRoutes());
	app.use('/', userRoutes());
	app.use('/reviews', reviewsRoutes());
};
