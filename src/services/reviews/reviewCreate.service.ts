import AppDataSource from "../../data-source";
import { Review } from "../../entities/review.entity";
import { User } from "../../entities/user.entity";
import { AppError } from "../../errors/appError";
import { IReviewRequest } from "../../interfaces/reviews";
import { Reservation } from "../../entities/reservation.entity";

const reviewCreateService = async (
  newReviewData: IReviewRequest,
  userId: string
) => {
  const reviewRepository = AppDataSource.getRepository(Review);
  const userRepository = AppDataSource.getRepository(User);
  const reservationRepository = AppDataSource.getRepository(Reservation);

  const validadeReservation = await reservationRepository.findOne({
    where: {
      id: newReviewData.reservation_id,
    },
  });

  const owner = await userRepository.findOneBy({
    id: userId,
  });

  if (!owner) throw new AppError("Logged in user doesn't exist (impossible)");

  const allReviews = await reviewRepository.find({
    relations: {
      reservation: true,
    },
  });

  if (!validadeReservation) {
    throw new AppError("Reservation not found!", 401);
  }

  // descomentar assim que a reservation tiver a atualização automatica!
  // if (validadeReservation.status !== "concluded") {
  //   throw new AppError("This reservarion is not concluded!", 401);
  // }

  const isAlreadyReview = allReviews.find(
    (el) => el.reservation.id === newReviewData.reservation_id
  );

  if (isAlreadyReview) {
    throw new AppError("This reservation has already been rated!", 401);
  }

  const review = new Review();

  review.review_text = newReviewData.review_text;
  review.stars = newReviewData.stars;
  review.user = owner;
  review.reservation = validadeReservation;

  reviewRepository.create(review);

  const newReview = await reviewRepository.save(review);

  return newReview;
};

export default reviewCreateService;
