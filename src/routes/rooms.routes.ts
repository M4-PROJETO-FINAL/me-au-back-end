import { Router } from 'express';
import roomsDatesController from '../controllers/rooms/roomsDates.controller';
import roomsGetController from '../controllers/rooms/roomsGet.controller';
import roomTypesGetController from '../controllers/rooms/roomTypesGet.controller';
import { authUser } from '../middlewares/authUser.middleware';
import validateIsAdm from '../middlewares/validateIsAdm.middleware';

const routes = Router();

export const roomsRoutes = () => {
	routes.get('/types', roomTypesGetController);
	routes.get('/', authUser, validateIsAdm, roomsGetController);
	routes.get('/dates/:room_type_id', roomsDatesController);

	return routes;
};
