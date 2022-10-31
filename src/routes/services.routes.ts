import { Router } from 'express';
import servicesGetController from '../controllers/services/servicesGet.controller';

const routes = Router();

routes.get('', servicesGetController);

export default routes;
