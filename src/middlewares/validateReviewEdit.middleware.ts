import { Request, Response, NextFunction } from "express";
import { IEditReview } from "../interfaces/reviews";

export const validateReviewEdit = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const reviewData: IEditReview = req.body;

  const stars = reviewData.stars;

  if (stars! < 1) {
    return res.status(400).json({
      message: "Minimum stars is 1",
    });
  }

  if (stars! > 5) {
    return res.status(400).json({
      message: "Maximum stars is 5",
    });
  }

  next();
};
