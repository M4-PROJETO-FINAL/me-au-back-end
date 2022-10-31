import { authUser } from '../middlewares/authUser.middleware';
import { validateReviewCreate } from '../middlewares/validateReviewCreate.middleware';
import { Router } from 'express';
import reviewCreateController from '../controllers/reviews/reviewCreate.controller';
import reviewGetController from '../controllers/reviews/reviewGet.controller';

const routes = Router();

routes.post('/reviews', authUser, validateReviewCreate, reviewCreateController);

routes.get('/reviews', reviewGetController);

export default routes;
