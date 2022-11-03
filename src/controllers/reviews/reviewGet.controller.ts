import { instanceToPlain } from "class-transformer";
import { Request, Response } from "express";
import reviewGetService from "../../services/reviews/reviewGet.service";

const reviewGetController = async (req: Request, res: Response) => {
  const reviews = await reviewGetService();

  return res.json(instanceToPlain(reviews));
};

export default reviewGetController;
