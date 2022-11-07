import { areDatesConflicting, getDatesInRange } from "./dates";
import AppDataSource from "../../../data-source";
import { Reservation } from "../../../entities/reservation.entity";
import { Room } from "../../../entities/room.entity";
import { RoomType } from "../../../entities/roomType.entity";
import { AppError } from "../../../errors/appError";
import { ReservationPet } from "../../../entities/reservationPet.entity";

/**
 * Returns an array with all reservations made for a particular room type,
 * specified by the parameter. Does not include cancelled or concluded reservations.
 */
export const getAllReservationsOfAGivenRoomType = async (
  room_type_id: string
) => {
  const reservationsRepository = AppDataSource.getRepository(Reservation);
  const allReservations = await reservationsRepository.find({
    relations: [
      "reservation_pets",
      "reservation_pets.room",
      "reservation_pets.room.room_type",
    ],
  });

  const reservationsOfSameRoomType = allReservations.filter((reservation) => {
    const reservationRoomsTypesIds = reservation.reservation_pets.map(
      (reservationPet) => {
        return reservationPet.room.room_type.id;
      }
    );

    return (
      reservationRoomsTypesIds.includes(room_type_id) &&
      (reservation.status === "reserved" || reservation.status === "active")
    );
  });

  return reservationsOfSameRoomType;
};

/**
 * Returns the number of pets occuppying the shared room in a give date,
 * specified by the date param
 */
export const numberOfPetsInSharedRoom = async (date: Date): Promise<number> => {
  const roomTypesRepository = AppDataSource.getRepository(RoomType);
  const allRoomTypes = await roomTypesRepository.find();
  const sharedRoomId = allRoomTypes.find((roomType) =>
    roomType.title.includes("Compartilhado")
  )!.id;
  const reservationsOfSameRoomType = await getAllReservationsOfAGivenRoomType(
    sharedRoomId
  );
  const sharedRoomReservationsInThatDate = reservationsOfSameRoomType.filter(
    (res) => {
      const resCheckin = res.checkin.getTime();
      const resCheckout = res.checkout.getTime();
      const resIncludesDate =
        resCheckin <= date.getTime() && resCheckout > date.getTime();
      return resIncludesDate;
    }
  );

  let count = 0;
  sharedRoomReservationsInThatDate.forEach((reservation) => {
    reservation.reservation_pets.forEach((reservationPet) => {
      if (reservationPet.room.room_type.id === sharedRoomId) count++;
    });
  });
  return count;
};

/**
 * Returns true if there is at least one room of the desired type available in the desired date.
 *
 * Warning: this function does not expect to receive a room_type_id referring to the shared room, only to the other two room types.
 */
export const existsAvailableRoom = async (
  date: Date,
  room_type_id: string
): Promise<boolean> => {
  const reservationsOfSameRoomType = await getAllReservationsOfAGivenRoomType(
    room_type_id
  );

  const reservationsOfSameRoomTypeThatContainDate =
    reservationsOfSameRoomType.filter((res) => {
      const resCheckin = res.checkin.getTime();
      const resCheckout = res.checkout.getTime();
      const resIncludesDate =
        resCheckin <= date.getTime() && resCheckout > date.getTime();
      return resIncludesDate;
    });
  return reservationsOfSameRoomTypeThatContainDate.length < 4;
};

/**
 * Returns a room of a specific type (specified by room_type_id) which is available (has no reservations) in a given time window (specified by checkin and checkout).
 *
 * If room_type_id refers to the shared room, the shared room will be returned if and only if it is operating below its full capacity (of 20 dogs) for all dates in the specified range.
 */
export const getAvailableRoom = async (
  checkin: Date,
  checkout: Date,
  room_type_id: string,
  currentReservationPets: ReservationPet[]
): Promise<Room> => {
  const roomTypesRepository = AppDataSource.getRepository(RoomType);
  const roomType = await roomTypesRepository.findOneBy({ id: room_type_id });
  if (!roomType)
    throw new AppError("Attempted to reserve an invalid room type");

  const roomRepository = AppDataSource.getRepository(Room);
  const allRooms = await roomRepository.find({
    relations: {
      room_type: true,
    },
  });

  const requiredDates = getDatesInRange(checkin, checkout);

  if (roomType.title === "Quarto Compartilhado") {
    for (let i = 0; i < requiredDates.length; i++) {
      const date = requiredDates[i];
      const population = await numberOfPetsInSharedRoom(date);
      if (population >= roomType.capacity)
        throw new AppError(`Shared room is full on ${date}`);
    }

    const sharedRoom = allRooms.find(
      (room) => room.room_type.id === room_type_id
    );
    if (!sharedRoom)
      throw new Error("Couldn't find shared room (???? impossible)");
    return sharedRoom;
  }

  const reservationsOfThatRoomType = await getAllReservationsOfAGivenRoomType(
    room_type_id
  );

  const conflictingReservationsOfThatRoomType =
    reservationsOfThatRoomType.filter((res) => {
      return areDatesConflicting(checkin, checkout, res.checkin, res.checkout);
    });

  // quartos já ocupados NESSA reserva q está sendo criada agr:
  const alreadyOccupiedRoomsIds = currentReservationPets.map(
    (resPet) => resPet.room.id
  );

  const allRoomsOfThatType = allRooms.filter(
    (room) => room.room_type.id === room_type_id
  );
  const idsOfAvailableRoomsOfThatType = allRoomsOfThatType
    .map((room) => room.id)
    .filter((roomId) => !alreadyOccupiedRoomsIds.includes(roomId));
  // remover quartos que já foram alocados pra 2 pets nessa reserva:

  for (let i = 0; i < conflictingReservationsOfThatRoomType.length; i++) {
    const reservation = conflictingReservationsOfThatRoomType[i];
    const reservationPets = reservation.reservation_pets;
    reservationPets.forEach((resPet) => {
      if (idsOfAvailableRoomsOfThatType.includes(resPet.room.id)) {
        const idx = idsOfAvailableRoomsOfThatType.indexOf(resPet.room.id);
        idsOfAvailableRoomsOfThatType.splice(idx, 1);
      }
    });
  }

  if (idsOfAvailableRoomsOfThatType.length === 0)
    throw new AppError(`No available rooms of type '${roomType.title}'`);

  const availableRoom = allRoomsOfThatType.find(
    (room) => room.id === idsOfAvailableRoomsOfThatType[0]
  );
  if (!availableRoom)
    throw new AppError("OUTRO ERRO IMPOSSÍVEL, CALA A BOCA TYPESCRIPT");
  return availableRoom;
};
