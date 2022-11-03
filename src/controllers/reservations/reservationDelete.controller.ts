import { Request, Response } from 'express';
import reservationDeleteService from '../../services/reservations/reservationDelete.service';

const reservationDeleteController = async (req: Request, res: Response) => {
		const { id } = req.params;

		const reservation = await reservationDeleteService(id);

		return res.status(204).json({ message: 'Reservation cancelled successfully.'});
};

export default reservationDeleteController;
