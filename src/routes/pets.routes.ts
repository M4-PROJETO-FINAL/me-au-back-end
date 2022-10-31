import { Router } from 'express';
import petCreateController from '../controllers/pets/petCreate.controller';
import petGetController from '../controllers/pets/petGet.controller';
import { authUser } from '../middlewares/authUser.middleware';

const routes = Router();

routes.post('', authUser, petCreateController);
routes.get('', authUser, petGetController);
routes.patch('/:id', authUser);
routes.delete('/:id', authUser);
export default routes;
