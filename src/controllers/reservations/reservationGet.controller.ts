import { instanceToPlain } from "class-transformer";
import { Request, Response } from "express";
import reservationGetService from "../../services/reservations/reservationGet.service";

const reservationGetController = async (req: Request, res: Response) => {
  const { id, is_adm } = req.user;
  const reservation = await reservationGetService(id, is_adm);

  return res.status(200).json(instanceToPlain(reservation));
};

export default reservationGetController;
