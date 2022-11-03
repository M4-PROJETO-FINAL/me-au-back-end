import AppDataSource from "../../data-source";
import { Review } from "../../entities/review.entity";
import { IEditReview } from "../../interfaces/reviews";
import { AppError } from "../../errors/appError";
import { User } from "../../entities/user.entity";

const reviewEditService = async (
  { review_text, stars }: IEditReview,
  reviewId: string,
  user: { id: string; is_adm: boolean }
) => {
  const reviewRepository = AppDataSource.getRepository(Review);
  const userRepository = AppDataSource.getRepository(User);

  const reviews = await reviewRepository.find({ relations: { user: true } });

  const reviewFound = reviews.find((review) => review.id === reviewId);

  if (!reviewFound) throw new AppError("Review not found!");

  const owner = await userRepository.findOneBy({ id: reviewFound.user.id });

  if (!owner) throw new AppError("Owner not found");

  if (owner.id !== user.id && !user.is_adm) {
    throw new AppError("You don't have permission!", 403);
  }

  // funcionando o update
  await reviewRepository.update(reviewId, {
    review_text,
    stars,
  });
  const reviewUpdate = reviewRepository.findOneBy({
    id: reviewId,
  });

  return reviewUpdate;
};

export default reviewEditService;
