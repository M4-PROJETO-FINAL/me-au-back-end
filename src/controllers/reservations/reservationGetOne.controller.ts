import { instanceToPlain } from 'class-transformer';
import { Request, Response } from 'express';
import reservationGetOneService from '../../services/reservations/reservationGetOne.service';

const reservationGetOneController = async (req: Request, res: Response) => {
	const { id } = req.params;

	const reservation = await reservationGetOneService(id);

	return res.status(200).json(instanceToPlain(reservation));
};

export default reservationGetOneController;
