import { Router } from "express";
import petCreateController from "../controllers/pets/petCreate.controller";
import petGetController from "../controllers/pets/petGet.controller";
import { authUser } from "../middlewares/authUser.middleware";

const petsRoutes = Router();

petsRoutes.post("", authUser, petCreateController);
petsRoutes.get("", authUser, petGetController);
petsRoutes.patch("/:id", authUser);
petsRoutes.delete("/:id", authUser);

export default petsRoutes;
