import AppDataSource from "../../data-source";
import { Review } from "../../entities/review.entity";
import { User } from "../../entities/user.entity";
import { AppError } from "../../errors/appError";
import { IReviewRequest } from "../../interfaces/reviews";

const reviewCreateService = async (
  newReviewData: IReviewRequest,
  userId: string
) => {
  const reviewRepository = AppDataSource.getRepository(Review);
  const userRepository = AppDataSource.getRepository(User);

  const owner = await userRepository.findOneBy({
    id: userId,
  });

  if (!owner) throw new AppError("Logged in user doesn't exist (impossible)");

  const review = new Review();

  review.review_text = newReviewData.review_text;
  review.stars = newReviewData.stars;

  reviewRepository.create(review);

  const newReview = await reviewRepository.save(review);

  return newReview;
};

export default reviewCreateService;
