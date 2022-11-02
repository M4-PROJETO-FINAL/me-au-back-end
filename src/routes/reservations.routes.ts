import { Router } from 'express';
import reservationCreateController from '../controllers/reservations/reservationCreate.controller';
import reservationDeleteController from '../controllers/reservations/reservationDelete.controller';
import { authUser } from '../middlewares/authUser.middleware';

const routes = Router();

routes.post('', authUser, reservationCreateController);
routes.delete('/:id', authUser, reservationDeleteController);

export default routes;
