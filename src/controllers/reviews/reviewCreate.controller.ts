import { instanceToPlain } from "class-transformer";
import { Request, Response } from "express";
import { IReviewRequest } from "../../interfaces/reviews";
import reviewCreateService from "../../services/reviews/reviewCreate.service";

const reviewCreateController = async (req: Request, res: Response) => {
  const newReviewData: IReviewRequest = req.body;
  const userId = req.user.id;

  const newReview = await reviewCreateService(newReviewData, userId);
  return res.status(201).json(instanceToPlain(newReview));
};

export default reviewCreateController;
