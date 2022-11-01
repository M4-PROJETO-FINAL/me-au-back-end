import { authUser } from "../middlewares/authUser.middleware";
import { validateReviewCreate } from "../middlewares/validateReviewCreate.middleware";
import { Router } from "express";
import reviewCreateController from "../controllers/reviews/reviewCreate.controller";
import reviewGetController from "../controllers/reviews/reviewGet.controller";
import reviewEditController from "../controllers/reviews/reviewUpdate.controller";
import reviewDeleteController from "../controllers/reviews/reviewDelete.controller";

const reviewRoutes = Router();

reviewRoutes.post("", authUser, validateReviewCreate, reviewCreateController);
reviewRoutes.get("", reviewGetController);
reviewRoutes.delete("/:id", authUser, reviewDeleteController);
reviewRoutes.patch("/:id", authUser, reviewEditController);

export default reviewRoutes;
