import { Router } from "express";
import roomsDatesController from "../controllers/rooms/roomsDates.controller";
import roomsGetController from "../controllers/rooms/roomsGet.controller";
import roomTypesGetController from "../controllers/rooms/roomTypesGet.controller";
import { authUser } from "../middlewares/authUser.middleware";
import validateIsAdm from "../middlewares/validateIsAdm.middleware";

const roomsRoutes = Router();

roomsRoutes.get("/types", roomTypesGetController);
roomsRoutes.get("/", authUser, validateIsAdm, roomsGetController);
roomsRoutes.get("/dates/:room_type_id", roomsDatesController);

export default roomsRoutes;
