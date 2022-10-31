import { Request, Response, NextFunction } from "express";
import { IReviewRequest } from "../interfaces/reviews";

export const validateReviewCreate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const reviewData: IReviewRequest = req.body;

  const stars = reviewData.stars;
  const review_text = reviewData.review_text;

  if (!review_text) {
    return res.status(400).json({
      message: "Review text is required",
    });
  }

  if (!stars) {
    return res.status(400).json({
      message: "Stars is required",
    });
  }

  if (stars < 1) {
    return res.status(400).json({
      message: "Minimum stars is 1",
    });
  }

  if (stars > 5) {
    return res.status(400).json({
      message: "Maximum stars is 5",
    });
  }

  next();
};
