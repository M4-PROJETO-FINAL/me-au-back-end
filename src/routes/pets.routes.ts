import { Router } from 'express';
import petCreateController from '../controllers/pets/petCreate.controller';
import petDeleteController from '../controllers/pets/petDelete.controller';
import petGetController from '../controllers/pets/petGet.controller';
import petUpdateController from '../controllers/pets/petUpdate.controller';
import { authUser } from '../middlewares/authUser.middleware';

const routes = Router();

export const petsRoutes = () => {
	routes.post('', authUser, petCreateController);
	routes.get('', authUser, petGetController);
	routes.patch('/:id', authUser, petUpdateController);
	routes.delete('/:id', authUser, petDeleteController);

	return routes;
};
