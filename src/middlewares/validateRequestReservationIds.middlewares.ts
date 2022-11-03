import { IReservationRequest } from "./../interfaces/reservations/index";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/appError";
import AppDataSource from "../data-source";
import { Pet } from "../entities/pet.entity";
import { RoomType } from "../entities/roomType.entity";
import { Service } from "../entities/service.entity";

const validateRequestReservationIds = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const reservation: IReservationRequest = req.body;

	const petRepository = AppDataSource.getRepository(Pet);
	const allPets = await petRepository.find({});
	const allPetsId = allPets.map((pet) => pet.id);
	const petsIdRequest = reservation.pet_rooms.map(
		(pet_room) => pet_room.pet_id
	);

	const isAllPetsExisted = petsIdRequest.every((id) => {
		if (allPetsId.includes(id)) return true;
		return false;
	});
	if (!isAllPetsExisted) throw new AppError("Invalid pet_id.", 400);

	const roomRepository = AppDataSource.getRepository(RoomType);
	const allRoomsType = await roomRepository.find({});
	const allRoomsTypeId = allRoomsType.map((room) => room.id);
	const roomsIdTypeRequest = reservation.pet_rooms.map(
		(pet_room) => pet_room.room_type_id
	);

	const isAllRoomTypesExisted = roomsIdTypeRequest.every((id) => {
		if (allRoomsTypeId.includes(id)) return true;
		return false;
	});
	if (!isAllRoomTypesExisted) throw new AppError("Invalid room_type_id.");

	// if the body request has services.
	if (reservation.services) {
		const serviceRepository = AppDataSource.getRepository(Service);

		const allServices = await serviceRepository.find({});
		const allServicesId = allServices.map((room) => room.id);
		const servicesRequest = reservation.services.map(
			(services) => services.service_id
		);
		const isAllServicesExisted = servicesRequest.every((id) => {
			if (allServicesId.includes(id)) return true;
			return false;
		});
		if (!isAllServicesExisted) throw new AppError("Invalid service_id.");
	}

	next();
};

export default validateRequestReservationIds;
