import { Request, Response } from "express";
import { IReservationRequest } from "../../interfaces/reservations";
import { ReservationCreateService } from "../../services/reservations/reservationCreate.service";

const reservationCreateController = async (req: Request, res: Response) => {
	const newReservationData: IReservationRequest = req.body;
	const { id } = req.user;

	const reservationCreated = await ReservationCreateService({
		user_id: id,
		...newReservationData,
	});
	return res.status(201).json(reservationCreated);
};

export default reservationCreateController;
