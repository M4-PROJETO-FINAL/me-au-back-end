import { Request, Response } from 'express';
import reservationDeleteService from '../../services/reservations/reservationDelete.service';

const reservationDeleteController = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		const reservation = await reservationDeleteService(id);

		return res.status(204).json({ message: 'Reservation cancelled successfully.'});
	} catch (err) {
		if (err instanceof Error) {
			return res.status(400).send({
				error: err.name,
				message: { message: err.message },
			});
		}
	}
};

export default reservationDeleteController;
