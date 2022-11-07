import { Router } from "express";
import reservationCreateController from "../controllers/reservations/reservationCreate.controller";
import reservationDeleteController from "../controllers/reservations/reservationDelete.controller";
import reservationGetController from "../controllers/reservations/reservationGet.controller";
import reservationGetOneController from "../controllers/reservations/reservationGetOne.controller";
import { authUser } from "../middlewares/authUser.middleware";
import validateCheckinCheckoutDates from "../middlewares/validateCheckinCheckoutDates.middlewares";
import validateIsAdm from "../middlewares/validateIsAdm.middleware";
import validateRequestReservationIds from "../middlewares/validateRequestReservationIds.middlewares";
import validateIsCatOrDogMiddleware from "../middlewares/validateIsDogOrCat.middleware";
import validatePetIsAlreadyScheduled from "../middlewares/validatePetIsAlreadyScheduled.middleware";
import verifyDates from "../middlewares/verifyDates.middleware";

const routes = Router();

export const reservationRoutes = () => {
  routes.get("", authUser, reservationGetController);
  routes.get("/:id", authUser, reservationGetOneController);
  routes.post(
    "",
    authUser,
    validateCheckinCheckoutDates,
    validateRequestReservationIds,
    validateIsCatOrDogMiddleware,
    validatePetIsAlreadyScheduled,
    verifyDates,
    reservationCreateController
  );
  routes.delete("/:id", authUser, reservationDeleteController);

  return routes;
};
