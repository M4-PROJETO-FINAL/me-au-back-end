import { instanceToPlain } from "class-transformer";
import { Request, Response } from "express";
import { IEditReview } from "../../interfaces/reviews";
import reviewEditService from "../../services/reviews/reviewUpdate.service";

const reviewEditController = async (req: Request, res: Response) => {
  const { review_text, stars }: IEditReview = req.body;
  const reviewId = req.params.id;
  const user = req.user;

  const newReview = await reviewEditService(
    { review_text, stars },
    reviewId,
    user
  );
  return res.status(200).json(instanceToPlain(newReview));
};

export default reviewEditController;
