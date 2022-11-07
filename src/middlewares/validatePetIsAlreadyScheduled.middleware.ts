import { Request, Response, NextFunction } from "express";
import AppDataSource from "../data-source";
import { Pet } from "../entities/pet.entity";
import { Reservation } from "../entities/reservation.entity";
import { AppError } from "../errors/appError";
import { IReservationRequest } from "../interfaces/reservations";
import { areDatesConflicting } from "../services/rooms/auxiliaryFunctions/dates";

const validatePetIsAlreadyScheduled = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { checkin, checkout, pet_rooms }: IReservationRequest = req.body;
	const reservationsRepository = AppDataSource.getRepository(Reservation);
	const allReservations = await reservationsRepository.find({
		relations: ["reservation_pets", "reservation_pets.pet"],
	});

	const petIds = pet_rooms.map((petRoom) => petRoom?.pet_id);

	for (let i = 0; i < petIds.length; i++) {
		const currPetId = petIds[i];

		const reservationsThatIncludeCurrPet = allReservations.filter((res) => {
			const petIdsInThisRes = res.reservation_pets.map(
				(resPet) => resPet?.pet?.id
			);
			return (
				petIdsInThisRes.includes(currPetId) &&
				(res.status === "reserved" || res.status === "active")
			);
		});

		if (reservationsThatIncludeCurrPet.length === 0) continue;

		for (let j = 0; j < reservationsThatIncludeCurrPet.length; j++) {
			const res = reservationsThatIncludeCurrPet[i];
			const checkinDate = new Date(checkin);
			const checkoutDate = new Date(checkout);
			if (
				areDatesConflicting(
					checkinDate,
					checkoutDate,
					res.checkin,
					res.checkout
				)
			) {
				const conflictingPet = await AppDataSource.manager.findOneBy(Pet, {
					id: currPetId,
				});
				if (!conflictingPet) throw new AppError("Pet not found");
				throw new AppError(
					`${conflictingPet.name} is already booked for a conflicting date`
				);
			}
		}
	}

	next();
};

export default validatePetIsAlreadyScheduled;
