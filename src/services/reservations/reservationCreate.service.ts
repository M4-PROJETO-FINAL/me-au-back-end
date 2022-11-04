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
  const roomTypesRepository = AppDataSource.getRepository(RoomType);
  const roomTypes = await roomTypesRepository.find();

  const catRoomId = roomTypes.find(
    (e) => e.title === "Quarto Privativo (gatos)"
  )?.id;
  const dogRoomId = roomTypes.find(
    (e) => e.title === "Quarto Privativo (cães)"
  )?.id;
  const sharedRoomId = roomTypes.find(
    (e) => e.title === "Quarto Compartilhado"
  )?.id;

  const petRoomsForCat = pet_rooms.filter(
    ({ room_type_id }) => catRoomId === room_type_id
  );
  const petRoomsForDog = pet_rooms.filter(
    ({ room_type_id }) => dogRoomId === room_type_id
  );
  const petRoomsShared = pet_rooms.filter(
    ({ room_type_id }) => sharedRoomId === room_type_id
  );

  const allReservationPets: ReservationPet[] = [];

  let numberOfPetsInTheRoom = 0;
  let availableRoom: any;

  for (let i = 0; i < petRoomsForCat.length; i++) {
    const petRoom = petRoomsForCat[i];

    const currentPet = allPets.find((pet) => pet.id === petRoom.pet_id);

    if (numberOfPetsInTheRoom === 2 || i === 0) {
      availableRoom = await getAvailableRoom(
        checkin,
        checkout,
        petRoom.room_type_id,
        allReservationPets
      );
      numberOfPetsInTheRoom = 0;
    }
    numberOfPetsInTheRoom++;

    console.log(`cat #${i + 1} being put in room ${availableRoom.id}`);

    const reservationPet = reservationPetRepository.create({
      pet: currentPet,
      room: availableRoom,
    });
    await reservationPetRepository.save(reservationPet);
    allReservationPets.push(reservationPet);
  }

  for (let i = 0; i < petRoomsForDog.length; i++) {
    const petRoom = petRoomsForDog[i];

    const currentPet = allPets.find((pet) => pet.id === petRoom.pet_id);

    //reset room
    if (numberOfPetsInTheRoom === 2 || i === 0) {
      availableRoom = await getAvailableRoom(
        checkin,
        checkout,
        petRoom.room_type_id,
        allReservationPets
      );
      numberOfPetsInTheRoom = 0;
    }
    numberOfPetsInTheRoom++;

    console.log(`dog #${i + 1} being put in room ${availableRoom.id}`);

    const reservationPet = reservationPetRepository.create({
      pet: currentPet,
      room: availableRoom,
    });
    await reservationPetRepository.save(reservationPet);
    allReservationPets.push(reservationPet);
  }

  for (let i = 0; i < petRoomsShared.length; i++) {
    const petRoom = petRoomsShared[i];

    const currentPet = allPets.find((pet) => pet.id === petRoom.pet_id);
    availableRoom = await getAvailableRoom(
      checkin,
      checkout,
      petRoom.room_type_id,
      allReservationPets
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
