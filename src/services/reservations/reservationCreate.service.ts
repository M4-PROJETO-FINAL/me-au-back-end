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

  const allReservationPets: ReservationPet[] = [];
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
