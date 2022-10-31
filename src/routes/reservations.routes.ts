import { Router } from "express";
import reservationCreateController from "../controllers/reservations/reservationCreate.controller";
import { authUser } from "../middlewares/authUser.middleware";

const routes = Router();

routes.post("", authUser, reservationCreateController);

export default routes;
