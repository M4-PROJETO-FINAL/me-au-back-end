import { instanceToPlain } from "class-transformer";
import { Request, Response } from 'express';
import reservationGetService from '../../services/reservations/reservationGet.service';

const reservationGetController = async (req: Request, res: Response) => {
	const reservation = await reservationGetService();

	return res.status(200).json(instanceToPlain(reservation));
};

export default reservationGetController;
