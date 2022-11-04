import { validateUserExists } from "./../middlewares/validateUserExists.middleware";
import { authUser } from "./../middlewares/authUser.middleware";
import {
  userCreateSchema,
  validateUserCreate,
} from "../middlewares/validateUserCreate.middleware";
import { Router } from "express";
import UserLoginController from "../controllers/users/userLogin.controller";
import userCreateController from "../controllers/users/userCreate.controller";
import UserGetController from "../controllers/users/userGet.controller";
import validateIsAdm from "../middlewares/validateIsAdm.middleware";
import userUpdateController from "../controllers/users/userUpdate.controller";
import {
  userUpdateSchema,
  validateUserUpdate,
} from "../middlewares/validateUserUpdate";
import userDeleteController from "../controllers/users/userDelete.controller";
import UserForgotPasswordController from "../controllers/users/userForgotPassword.controller";
import UserVerifyPwController from "../controllers/users/userVerifyPw.controller";
import UserResetPasswordController from "../controllers/users/userResetPassword.controller";

const routes = Router();

export const userRoutes = () => {
  routes.post("", validateUserCreate(userCreateSchema), userCreateController);
  routes.get("", authUser, UserGetController);
  routes.patch(
    "/:id",
    validateUserExists,
    authUser,
    // validateUserUpdate(userUpdateSchema),
    userUpdateController
  );
  routes.delete(
    "/:id",
    validateUserExists,
    authUser,
    validateIsAdm,
    userDeleteController
  );

  return routes;
};
