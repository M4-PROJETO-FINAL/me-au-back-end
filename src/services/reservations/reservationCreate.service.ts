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

// ajeitar any
export const ReservationCreateService = async ({
  user_id,
  checkin,
  checkout,
  pet_rooms,
  services,
}: any) => {
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
  console.log(allServices);
  // [idService1, idService2, idService3, id ]
  // [serviços faltava name, descrição] ====>

  let allReservationsServices: any = [];
  if (services) {
    for (let i = 0; i < (services?.length || 0); i++) {
      const serv = services[i];
      console.log(serv, "213123123321");
      const service = allServices.find(
        (service) => service.id === serv.service_id
      );
      console.log(service, "234342234423");
      const reservationService = reservationServicesRepository.create({
        amount: serv.amount,
        service,
      });
      await reservationServicesRepository.save(reservationService);

      allReservationsServices.push(reservationService);
    }
  }

  // const allReservationsServices = await Promise.all<any>(
  // 	services?.map(async (serv) => {
  // 		const service = allServices.find((service) => service.id === serv.id);
  // 		const reservationService = reservationServicesRepository.create({
  // 			amount: serv.amount,
  // 			reservation,
  // 			service,
  // 		});
  // 		await reservationServicesRepository.save(reservationService);
  // 		return reservationService;
  // 	})
  // );

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
    console.log(allRooms);
    // const roomChoose = allRooms.filter(
    // 	(room) => room.room_type.id === petRoom.room_type_id
    // );
    // console.log(roomChoose);
    // aplicar uma lógica pra saber se o quarto está disponível ou não.

    const reservationPet = reservationPetRepository.create({
      pet: petChoose,
      room: allRooms[0],
    });
    await reservationPetRepository.save(reservationPet);
    allReservationPets.push(reservationPet);
  }

  // const allReservationPets = pet_rooms?.map((petRoom) => {
  // 	const petChoose = allPets.find((pet) => pet.id === petRoom.pet_id);
  // 	const roomChoose = allRooms.filter(
  // 		(room) => room.room_type.id === petRoom.room_type_id
  // 	);
  // 	console.log(petChoose);
  // 	console.log(roomChoose);

  // 	// aplicar uma lógica pra saber se o quarto está disponível ou não.
  // 	const reservationPet = reservationPetRepository.create({
  // 		pet: petChoose,
  // 		room: roomChoose[0],
  // 	});
  // 	reservationPetRepository.save(reservationPet);
  // 	return reservationPet;
  // });

  reservation.reservation_services = allReservationsServices!;
  reservation.reservation_pets = allReservationPets!;
  await reservationRepository.save(reservation);

  const petRoomsReservation = reservation.reservation_pets.map((resPet) => {
    return {
      pet_id: resPet.pet.id,
      room_type_id: resPet.room.room_type.id,
    };
  });
  console.log(petRoomsReservation);
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
