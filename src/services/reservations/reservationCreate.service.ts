import { Reservation } from "./../../entities/reservation.entity";
import AppDataSource from "../../data-source";
import {
	IReservationCreate,
	IReservationResponse,
} from "./../../interfaces/reservations/index";
import { User } from "../../entities/user.entity";
import { ReservationService } from "../../entities/reservationService.entity";
import { ReservationPet } from "../../entities/reservationPet.entity";
import { Service } from "../../entities/service.entity";
import { Pet } from "../../entities/pet.entity";
import { Room } from "../../entities/room.entity";

// ajeitar any
export const ReservationCreateService = async ({
	user_id,
	checkin,
	checkout,
	pet_rooms,
	services,
}: IReservationCreate): Promise<IReservationResponse> => {
	const reservationRepository = AppDataSource.getRepository(Reservation);
	const serviceRepository = AppDataSource.getRepository(Service);

	const reservationServicesRepository =
		AppDataSource.getRepository(ReservationService);

	const userRepository = AppDataSource.getRepository(User);
	const user = await userRepository.findOneBy({ id: user_id });

	const checkinDate = new Date(checkin);
	const checkoutDate = new Date(checkout);

	const reservation = new Reservation();
	reservation.checkin = checkinDate;
	reservation.checkout = checkoutDate;
	reservation.user = user!;

	const allServices = await serviceRepository.find();

	let allReservationsServices: ReservationService[] = [];
	if (services) {
		for (let i = 0; i < (services?.length || 0); i++) {
			const serv = services[i];
			const service = allServices.find(
				(service) => service.id === serv.service_id
			);
			const reservationService = reservationServicesRepository.create({
				amount: serv.amount,
				service,
			});
			await reservationServicesRepository.save(reservationService);

			allReservationsServices.push(reservationService);
		}
	}

	const reservationPetRepository = AppDataSource.getRepository(ReservationPet);

	const petRepository = AppDataSource.getRepository(Pet);
	const allPets = await petRepository.find();

	const roomRepository = AppDataSource.getRepository(Room);
	const allRooms = await roomRepository.find({
		relations: {
			room_type: true,
		},
	});
	let allReservationPets: ReservationPet[] = [];

	for (let i = 0; i < (pet_rooms?.length || 0); i++) {
		const petRoom = pet_rooms[i];

		const petChoose = allPets.find((pet) => pet.id === petRoom.pet_id);

		// no createReservation, na hora de criar o reservationPet, você está botando o room como o primeiro elemento do allRooms, mas esse vai ser sempre o quarto compartilhado
		// Tem que fazer uma lógica pra selecionar sempre o primeiro quarto disponível pra um dado tipo de quarto

		const reservationPet = reservationPetRepository.create({
			pet: petChoose,
			room: allRooms[0],
		});

		await reservationPetRepository.save(reservationPet);
		console.log(reservationPet);

		allReservationPets.push(reservationPet);
	}
	console.log(allReservationPets, "asdasddasds");

	reservation.reservation_services = allReservationsServices!;
	reservation.reservation_pets = allReservationPets!;
	await reservationRepository.save(reservation);
	const petRoomsReservation = reservation.reservation_pets.map((resPet) => {
		return {
			pet_id: resPet.pet.id,
			room_type_id: resPet.room.room_type.id,
		};
	});
	const servicesReservation = reservation.reservation_services.map((resSer) => {
		return {
			service_id: resSer.service.id,
			amount: resSer.amount,
		};
	});

	const newReservation = {
		id: reservation.id,
		status: reservation.status,
		created_at: reservation.created_at,
		updated_at: reservation.updated_at,
		checkin: reservation.checkin,
		checkout: reservation.checkout,
		pet_rooms: petRoomsReservation,
		services: servicesReservation,
	};
	// return reservation;
	return newReservation;
};
