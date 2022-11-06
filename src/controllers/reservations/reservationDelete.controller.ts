import { Request, Response } from "express";
import reservationDeleteService from "../../services/reservations/reservationDelete.service";

const reservationDeleteController = async (req: Request, res: Response) => {
  const { id: reservationId } = req.params;
  const { is_adm, id: userId } = req.user;

  await reservationDeleteService(reservationId, userId, is_adm);

  return res
    .status(204)
    .json({ message: "Reservation cancelled successfully." });
};

export default reservationDeleteController;
