import { Router } from 'express';

import UserForgotPasswordController from '../controllers/users/userForgotPassword.controller';
import UserLoginController from '../controllers/users/userLogin.controller';
import UserResetPasswordController from '../controllers/users/userResetPassword.controller';
import UserVerifyPwController from '../controllers/users/userVerifyPw.controller';

const routes = Router();

export const sessionsRoutes = () => {
	routes.post('/login', UserLoginController);
	routes.post('/forgot/verify', UserVerifyPwController);
	routes.patch('/forgot', UserForgotPasswordController);
	routes.patch('/forgot/:code', UserResetPasswordController);

    return routes
};
