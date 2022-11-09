import { Express } from "express";
import updateReservationStatus from "../middlewares/updateReservationStatus.middleware";
import { petsRoutes } from "./pets.routes";
import { reservationRoutes } from "./reservations.routes";
import { reviewRoutes } from "./reviews.routes";
import { roomsRoutes } from "./rooms.routes";
import { servicesRoutes } from "./services.routes";
import { sessionsRoutes } from "./sessions.routes";
import { userRoutes } from "./user.routes";

export const appRoutes = (app: Express) => {
  app.use("", sessionsRoutes());
  app.use("/pets", petsRoutes());
  app.use("/users", userRoutes());
  app.use("/rooms", roomsRoutes());
  app.use("/reviews", reviewRoutes());
  app.use("/services", servicesRoutes());
  app.use("/reservations", reservationRoutes());
};
