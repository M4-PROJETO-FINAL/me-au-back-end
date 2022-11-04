import { RoomType } from "./../../entities/roomType.entity";
import { Reservation } from "./../../entities/reservation.entity";
import AppDataSource from "../../data-source";
import { IReservationRequest } from "./../../interfaces/reservations/index";
import { User } from "../../entities/user.entity";
import { ReservationService } from "../../entities/reservationService.entity";
import { ReservationPet } from "../../entities/reservationPet.entity";
import { Service } from "../../entities/service.entity";
import { Pet } from "../../entities/pet.entity";
import { AppError } from "../../errors/appError";
import { IPetRoom } from "../../interfaces/rooms";
import { IService } from "../../interfaces/services";
import { getAvailableRoom } from "../rooms/auxiliaryFunctions/roomAvailability";
import { Room } from "../../entities/room.entity";

export const ReservationCreateService = async (
	user_id: string,
	{ checkin, checkout, pet_rooms, services }: IReservationRequest
) => {
	const reservationRepository = AppDataSource.getRepository(Reservation);

	const userRepository = AppDataSource.getRepository(User);
	const user = await userRepository.findOneBy({ id: user_id });
	if (!user) throw new AppError("Logged in user does not exist (impossible)");

	const reservation = new Reservation();
	reservation.user = user;
	reservation.reservation_services = await makeReservationServices(services);

	reservation.reservation_pets = await makeReservationPets(
		pet_rooms,
		new Date(checkin),
		new Date(checkout)
	);
	const checkinDate = new Date(checkin);
	const checkoutDate = new Date(checkout);
	reservation.checkin = checkinDate;
	reservation.checkout = checkoutDate;

	await reservationRepository.save(reservation);

	return makeResponseObject(reservation, pet_rooms, services);
};

async function makeReservationServices(
	services: IService[] | undefined
): Promise<ReservationService[]> {
	const serviceRepository = AppDataSource.getRepository(Service);
	const allServices = await serviceRepository.find();
	const reservationServicesRepository =
		AppDataSource.getRepository(ReservationService);

	const allReservationServices: ReservationService[] = [];
	if (services) {
		for (let i = 0; i < services.length; i++) {
			const serv = services[i];
			const service = allServices.find(
				(service) => service.id === serv.service_id
			);
			const reservationService = reservationServicesRepository.create({
				amount: serv.amount,
				service,
			});
			await reservationServicesRepository.save(reservationService);

			allReservationServices.push(reservationService);
		}
	}

	return allReservationServices;
}

async function makeReservationPets(
	pet_rooms: IPetRoom[],
	checkin: Date,
	checkout: Date
): Promise<ReservationPet[]> {
	const reservationPetRepository = AppDataSource.getRepository(ReservationPet);

	const petRepository = AppDataSource.getRepository(Pet);
	const allPets = await petRepository.find();

	// filter types
	// const roomTypesRepository = AppDataSource.getRepository(RoomType);
	// const roomsType = await roomTypesRepository.find({});

	// const roomTypeCatId = roomsType.find(
	// 	(e) => e.title === "Quarto Privativo (gatos)"
	// )?.id;
	// const roomTypeDogId = roomsType.find(
	// 	(e) => e.title === "Quarto Privativo (cães)"
	// )?.id;
	// const roomTypeSharedId = roomsType.find(
	// 	(e) => e.title === "Quarto Compartilhado"
	// )?.id;

	// const petRoomsForCat = pet_rooms.filter(
	// 	({ room_type_id }) => roomTypeCatId === room_type_id
	// );
	// const petRoomsForDog = pet_rooms.filter(
	// 	({ room_type_id }) => roomTypeDogId === room_type_id
	// );
	// const petRoomsShared = pet_rooms.filter(
	// 	({ room_type_id }) => roomTypeSharedId === room_type_id
	// );

	const allReservationPets: ReservationPet[] = [];

	// let numberOfPetsInTheRoom = 0;
	// let availableRoom: any;

	// //[[{}], [{}], [{}]]
	// for (let i = 0; i < petRoomsForCat.length; i++) {
	// 	const petRoom = pet_rooms[i];

	// 	const currentPet = allPets.find((pet) => pet.id === petRoom.pet_id);

	// 	//reset room
	// 	if (numberOfPetsInTheRoom === 2 || i === 0) {
	// 		availableRoom = await getAvailableRoom(
	// 			checkin,
	// 			checkout,
	// 			petRoom.room_type_id
	// 		);
	// 		numberOfPetsInTheRoom = 0;
	// 		console.log(availableRoom, "234432423");
	// 		console.log(numberOfPetsInTheRoom);
	// 	}
	// 	numberOfPetsInTheRoom++;

	// 	const reservationPet = reservationPetRepository.create({
	// 		pet: currentPet,
	// 		room: availableRoom,
	// 	});
	// 	console.log(availableRoom, "here");
	// 	await reservationPetRepository.save(reservationPet);
	// 	allReservationPets.push(reservationPet);
	// }

	// for (let i = 0; i < petRoomsForDog.length; i++) {
	// 	const petRoom = pet_rooms[i];

	// 	const currentPet = allPets.find((pet) => pet.id === petRoom.pet_id);

	// 	//reset room
	// 	if (numberOfPetsInTheRoom === 2 || i === 0) {
	// 		availableRoom = await getAvailableRoom(
	// 			checkin,
	// 			checkout,
	// 			petRoom.room_type_id
	// 		);
	// 		numberOfPetsInTheRoom = 0;
	// 	}
	// 	numberOfPetsInTheRoom++;

	// 	const reservationPet = reservationPetRepository.create({
	// 		pet: currentPet,
	// 		room: availableRoom,
	// 	});
	// 	await reservationPetRepository.save(reservationPet);
	// 	allReservationPets.push(reservationPet);
	// }

	// for (let i = 0; i < petRoomsShared.length; i++) {
	// 	const petRoom = pet_rooms[i];

	// 	const currentPet = allPets.find((pet) => pet.id === petRoom.pet_id);

	// 	//reset room
	// 	if (numberOfPetsInTheRoom === 2 || i === 0) {
	// 		availableRoom = await getAvailableRoom(
	// 			checkin,
	// 			checkout,
	// 			petRoom.room_type_id
	// 		);
	// 		numberOfPetsInTheRoom = 0;
	// 	}
	// 	numberOfPetsInTheRoom++;

	// 	const reservationPet = reservationPetRepository.create({
	// 		pet: currentPet,
	// 		room: availableRoom,
	// 	});
	// 	await reservationPetRepository.save(reservationPet);
	// 	allReservationPets.push(reservationPet);
	// }
	// for (let i=0; i<petRoomsForDog.length;i++){

	// }
	// for (let i=0; i<petRoomsShared.length;i++){

	// }

	// petRoomsForCat.forEach(async (pet_room, index) => {
	// 	const currentPet = allPets.find((pet) => pet.id === pet_room.pet_id);

	// 	//reset room
	//   // 0
	//   // 2
	// 	if (numberOfPetsInTheRoom === 2 || index === 0) {
	// 		availableRoom = await getAvailableRoom(
	// 			checkin,
	// 			checkout,
	// 			pet_room.room_type_id
	// 		);
	// 		numberOfPetsInTheRoom = 0;
	// 	}
	// 	numberOfPetsInTheRoom++;
	//   // 1
	//   // 2
	//   // 1
	// 	const reservationPet = reservationPetRepository.create({
	// 		pet: currentPet,
	// 		room: availableRoom,
	// 	});
	// 	await reservationPetRepository.save(reservationPet);
	// 	allReservationPets.push(reservationPet);
	// });

	// petRoomsForDog.forEach(async (pet_room, index) => {
	// 	const currentPet = allPets.find((pet) => pet.id === pet_room.pet_id);

	// 	//reset room
	// 	if (numberOfPetsInTheRoom === 2 || index === 0) {
	// 		availableRoom = await getAvailableRoom(
	// 			checkin,
	// 			checkout,
	// 			pet_room.room_type_id
	// 		);
	// 		numberOfPetsInTheRoom = 0;
	// 	}
	// 	numberOfPetsInTheRoom++;

	// 	const reservationPet = reservationPetRepository.create({
	// 		pet: currentPet,
	// 		room: availableRoom,
	// 	});
	// 	await reservationPetRepository.save(reservationPet);
	// 	allReservationPets.push(reservationPet);
	// });

	// petRoomsShared.forEach(async (pet_room, index) => {
	// 	const currentPet = allPets.find((pet) => pet.id === pet_room.pet_id);

	// 	availableRoom = await getAvailableRoom(
	// 		checkin,
	// 		checkout,
	// 		pet_room.room_type_id
	// 	);

	// 	const reservationPet = reservationPetRepository.create({
	// 		pet: currentPet,
	// 		room: availableRoom,
	// 	});
	// 	await reservationPetRepository.save(reservationPet);
	// 	allReservationPets.push(reservationPet);
	// });

	for (let i = 0; i < pet_rooms.length; i++) {
		const petRoom = pet_rooms[i];

		const currentPet = allPets.find((pet) => pet.id === petRoom.pet_id);
		const availableRoom = await getAvailableRoom(
			checkin,
			checkout,
			petRoom.room_type_id
		);
		const reservationPet = reservationPetRepository.create({
			pet: currentPet,
			room: availableRoom,
		});
		await reservationPetRepository.save(reservationPet);
		allReservationPets.push(reservationPet);
	}

	return allReservationPets;
}

function makeResponseObject(
	reservation: Reservation,
	pet_rooms: IPetRoom[],
	services: IService[] | undefined
) {
	return {
		id: reservation.id,
		status: reservation.status,
		created_at: reservation.created_at,
		updated_at: reservation.updated_at,
		checkin: reservation.checkin,
		checkout: reservation.checkout,
		pet_rooms: pet_rooms,
		services: services || [],
	};
}
