import { authUser } from "../middlewares/authUser.middleware";
import { validateReviewCreate } from "../middlewares/validateReviewCreate.middleware";
import { validateReviewEdit } from "../middlewares/validateReviewEdit.middleware";
import { Router } from "express";
import reviewCreateController from "../controllers/reviews/reviewCreate.controller";
import reviewGetController from "../controllers/reviews/reviewGet.controller";
import reviewEditController from "../controllers/reviews/reviewUpdate.controller";
import reviewDeleteController from "../controllers/reviews/reviewDelete.controller";

const routes = Router();

export const reviewRoutes = () => {
  routes.post("", authUser, validateReviewCreate, reviewCreateController);
  routes.get("", reviewGetController);
  routes.delete("/:id", authUser, reviewDeleteController);
  routes.patch("/:id", authUser, validateReviewEdit, reviewEditController);

  return routes;
};
