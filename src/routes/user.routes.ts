import { validateUserExists } from './../middlewares/validateUserExists.middleware';
import { authUser } from './../middlewares/authUser.middleware';
import {
	userCreateSchema,
	validateUserCreate,
} from '../middlewares/validateUserCreate.middleware';
import { Router } from 'express';
import UserLoginController from '../controllers/users/userLogin.controller';
import userCreateController from '../controllers/users/userCreate.controller';
import UserGetController from '../controllers/users/userGet.controller';
import validateIsAdm from '../middlewares/validateIsAdm.middleware';
import userUpdateController from '../controllers/users/userUpdate.controller';
import {
	userUpdateSchema,
	validateUserUpdate,
} from '../middlewares/validateUserUpdate';

const routes = Router();

export const userRoutes = () => {
	routes.post(
		'/users',
		validateUserCreate(userCreateSchema),
		userCreateController
	);
	routes.post('/login', UserLoginController);
	routes.get('/users', authUser, UserGetController);
	routes.patch(
		'/users/:id',
		validateUserExists,
		// validateUserUpdate(userUpdateSchema),
		userUpdateController,
		authUser
	);
	routes.delete('/users/:id', validateUserExists, authUser, validateIsAdm);

	return routes;
};
