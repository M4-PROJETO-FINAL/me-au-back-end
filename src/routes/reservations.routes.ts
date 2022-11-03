import { Router } from "express";
import reservationCreateController from "../controllers/reservations/reservationCreate.controller";
import reservationDeleteController from "../controllers/reservations/reservationDelete.controller";
import reservationGetController from "../controllers/reservations/reservationGet.controller";
import reservationGetOneController from "../controllers/reservations/reservationGetOne.controller";
import { authUser } from "../middlewares/authUser.middleware";
import validateCheckinCheckoutDates from "../middlewares/validateCheckinCheckoutDates.middlewares";
import validateIsAdm from "../middlewares/validateIsAdm.middleware";
import validateRequestReservationIds from "../middlewares/validateRequestReservationIds.middlewares";

const routes = Router();

routes.get("", authUser, validateIsAdm, reservationGetController);
routes.get("/:id", authUser, reservationGetOneController);
routes.post(
	"",
	authUser,
	validateCheckinCheckoutDates,
	validateRequestReservationIds,
	reservationCreateController
);
routes.delete("/:id", authUser, reservationDeleteController);

export default routes;
