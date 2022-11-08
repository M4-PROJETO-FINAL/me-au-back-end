import { Request, Response, NextFunction } from "express";
import AppDataSource from "../data-source";
import { Reservation } from "../entities/reservation.entity";

const updateReservationStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const reservationRepository = AppDataSource.getRepository(Reservation);
  const reservations = await reservationRepository.find();

  for (let i = 0; i < reservations.length; i++) {
    const checkin = reservations[i].checkin;
    const checkout = reservations[i].checkout;
    const today = new Date();

    if (
      reservations[i].status === "reserved" &&
      today.getTime() > checkin.getTime() &&
      today.getTime() < checkout.getTime()
    ) {
      await reservationRepository.update(reservations[i].id, {
        status: "active",
      });
    }
    if (reservations[i].status === "active" && today >= checkout) {
      await reservationRepository.update(reservations[i].id, {
        status: "concluded",
      });
    }
  }

  next();
};

export default updateReservationStatus;
