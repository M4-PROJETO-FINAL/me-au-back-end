import { Request, Response } from "express";
import reviewGetService from "../../services/reviews/reviewGet.service";

const reviewGetController = async (req: Request, res: Response) => {
  const reviews = await reviewGetService();

  return res.json(reviews);
};

export default reviewGetController;
