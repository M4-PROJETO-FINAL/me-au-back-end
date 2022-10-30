import { validateUserExists } from "./../middlewares/validateUserExists.middleware";
import { authUser } from "./../middlewares/authUser.middleware";
import {
	userCreateSchema,
	validateUserCreate,
} from "./../middlewares/validateUserSchema.middleware";
import { Router } from "express";
import UserLoginController from "../controllers/users/userLogin.controller";
import userCreateController from "../controllers/users/userCreate.controller";
import UserGetController from "../controllers/users/userGet.controller";
import validateIsAdm from "../middlewares/validateIsAdm.middleware";

const routes = Router();

routes.post(
	"/users",
	validateUserCreate(userCreateSchema),
	userCreateController
);
routes.post("/login", UserLoginController);
routes.get("/users", authUser, UserGetController);
routes.patch("/users/:id", validateUserExists, authUser);
routes.delete("/users/:id", validateUserExists, authUser, validateIsAdm);

export default routes;
