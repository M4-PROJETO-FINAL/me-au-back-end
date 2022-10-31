import { Reservation } from "./../../entities/reservation.entity";
import AppDataSource from "../../data-source";
import { IReservationRequest } from "./../../interfaces/reservations/index";
import { User } from "../../entities/user.entity";
import { ReservationService } from "../../entities/reservationService.entity";
import { ReservationPet } from "../../entities/reservationPet.entity";
import { Service } from "../../entities/service.entity";
import { Pet } from "../../entities/pet.entity";
import { Room } from "../../entities/room.entity";

interface IReservationCreate extends IReservationRequest {
	user_id: string;
}

export const ReservationCreateService = async ({
	user_id,
	checkin,
	checkout,
	pet_rooms,
	services,
}: IReservationCreate) => {
	const reservationRepository = AppDataSource.getRepository(Reservation);
	const serviceRepository = AppDataSource.getRepository(Service);

	const reservationServicesRepository =
		AppDataSource.getRepository(ReservationService);

	const userRepository = AppDataSource.getRepository(User);
	const user = await userRepository.findOneBy({ id: user_id });
	// 31/10/2022 <--> 10/11/2022
	// [01/11/2022, 02/11/2022, 03/11/2022, 04/11/2022, 05/11/2022...] []
	const checkinDate = new Date(checkin);
	const checkoutDate = new Date(checkout);

	const reservation = new Reservation();
	reservation.checkin = checkinDate;
	reservation.checkout = checkoutDate;
	reservation.user = user!;

	const allServices = await serviceRepository.find();
	// [idService1, idService2, idService3, id ]
	// [serviços faltava name, descrição] ====>

	const allReservationsServices = services?.map((serv) => {
		const service = allServices.find((service) => service.id === serv.id);
		const reservationService = reservationServicesRepository.create({
			amount: serv.amount,
			reservation,
			service,
		});
		reservationServicesRepository.save(reservationService);
		console.log(reservationService);
		return reservationService;
	});

	const reservationPetRepository = AppDataSource.getRepository(ReservationPet);

	const petRepository = AppDataSource.getRepository(Pet);
	const allPets = await petRepository.find();

	const roomRepository = AppDataSource.getRepository(Room);
	const allRooms = await roomRepository.find();

	const allReservationPets = pet_rooms?.map((petRoom) => {
		const petChoose = allPets.find((pet) => pet.id === petRoom.pet_id);
		const roomChoose = allRooms.filter(
			(room) => room.room_type.id === petRoom.room_type_id
		);

		// aplicar uma lógica pra saber se o quarto está disponível ou não.
		const reservationPet = reservationPetRepository.create({
			pet: petChoose,
			room: roomChoose[0],
			reservation: reservation,
		});
		return reservationPet;
	});
	reservation.reservation_services = allReservationsServices!;
	reservation.reservation_pets = allReservationPets!;
	reservationRepository.save(reservation);

	return reservation;
};
