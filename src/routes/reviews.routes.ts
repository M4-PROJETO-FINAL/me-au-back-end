import { authUser } from "../middlewares/authUser.middleware";
import { validateReviewCreate } from "../middlewares/validateReviewCreate.middleware";
import { Router } from "express";
import reviewCreateController from "../controllers/reviews/reviewCreate.controller";
import reviewGetController from "../controllers/reviews/reviewGet.controller";

const reviewsRoutes = Router();

reviewsRoutes.post("", authUser, validateReviewCreate, reviewCreateController);

reviewsRoutes.get("", reviewGetController);

export default reviewsRoutes;
