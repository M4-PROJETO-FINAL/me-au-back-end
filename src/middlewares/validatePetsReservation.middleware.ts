import { User } from "./../entities/user.entity";
import { NextFunction, Request, Response } from "express";
import AppDataSource from "../data-source";
import { AppError } from "../errors/appError";
import { IReservationRequest } from "../interfaces/reservations";

export const validatePetsReservationMiddleware = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const reservation: IReservationRequest = req.body;

	const hasDuplicattedPet = reservation.pet_rooms.some((pet_room, i) =>
		reservation.pet_rooms.some((e, index) => {
			return pet_room.pet_id === e.pet_id && i != index;
		})
	);

	if (hasDuplicattedPet)
		throw new AppError("There are duplicated pet in the request.");

	next();
};

export default validatePetsReservationMiddleware;
