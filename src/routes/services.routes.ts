import { Router } from 'express';
import servicesGetController from '../controllers/services/servicesGet.controller';

const routes = Router();

export const servicesRoutes = () => {
	routes.get('', servicesGetController);

	return routes;
};
