import AppDataSource from "../../data-source";
import { Review } from "../../entities/review.entity";
import { User } from "../../entities/user.entity";
import { AppError } from "../../errors/appError";
import { Reservation } from "../../entities/reservation.entity";
import { IsNull } from "typeorm";

const reviewDeleteService = async (
  reviewId: string,
  user: { id: string; is_adm: boolean }
) => {
  const userRepository = AppDataSource.getRepository(User);
  const reviewRepository = AppDataSource.getRepository(Review);

  const reviews = await reviewRepository.find({ relations: { user: true } });

  const reviewFound = reviews.find((review) => review.id === reviewId);

  if (!reviewFound) throw new AppError("Review not found!");

  const owner = await userRepository.findOneBy({ id: reviewFound.user.id });

  if (!owner) throw new AppError("Owner not found");

  if (owner.id === user.id) {
    // const reservationRepository = AppDataSource.getRepository(Reservation);

    // const userReservation = await reservationRepository.findOneBy({
    //   review: reviewFound,
    // });

    // await reservationRepository.update(userReservation!.id, {
    //   review: undefined,
    // });

    await reviewRepository.delete(reviewId);
  } else if (user.is_adm) {
    // const reservationRepository = AppDataSource.getRepository(Reservation);

    // const userReservation = await reservationRepository.findOneBy({
    //   review: reviewFound,
    // });

    // await reservationRepository.update(userReservation!.id, {
    //   review: undefined,
    // });

    await reviewRepository.delete(reviewId);
  } else {
    throw new AppError("You don't have permission!", 403);
  }
};

export default reviewDeleteService;
