import { Router } from "express";
import petCreateController from "../controllers/pets/petCreate.controller";
import petDeleteController from "../controllers/pets/petDelete.controller";
import petGetController from "../controllers/pets/petGet.controller";
import petUpdateController from "../controllers/pets/petUpdate.controller";
import { authUser } from "../middlewares/authUser.middleware";

const petsRoutes = Router();

petsRoutes.post("", authUser, petCreateController);
petsRoutes.get("", authUser, petGetController);
petsRoutes.patch("/:id", authUser, petUpdateController);
petsRoutes.delete("/:id", authUser, petDeleteController);

export default petsRoutes;
