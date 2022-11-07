import { Reservation } from "../../entities/reservation.entity";
import AppDataSource from "../../data-source";
import { AppError } from "../../errors/appError";

const reservationDeleteService = async (
  reservationId: string,
  userId: string,
  isAdm: boolean
) => {
  const reservationRepository = AppDataSource.getRepository(Reservation);

  const reservations = await reservationRepository.find({
    where: {
      id: reservationId,
    },
    relations: {
      user: true,
    },
  });

  if (reservations.length === 0) {
    throw new AppError("Reservation does not exists", 404);
  }
  const reservation = reservations[0];

  if (reservation.status === "cancelled") {
    throw new AppError("Reservation does not exist");
  }

  const ownerId = reservation.user.id;
  if (userId !== ownerId && !isAdm)
    throw new AppError(
      "Cannot delete this reservation without admin permissions",
      403
    );

  await reservationRepository.update(reservation.id, {
    status: (reservation.status = "cancelled"),
  });

  return reservation;
};

export default reservationDeleteService;
