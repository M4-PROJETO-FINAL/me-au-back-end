import { Request, Response } from "express";
import reviewDeleteService from "../../services/reviews/reviewDelete.service";

const reviewDeleteController = async (req: Request, res: Response) => {
  const reviewId = req.params.id;
  const user = req.user;

  await reviewDeleteService(reviewId, user);

  return res.status(204).json({ message: "Review deleted with sucess!" });
};

export default reviewDeleteController;
