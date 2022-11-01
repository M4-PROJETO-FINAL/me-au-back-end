import AppDataSource from "../../data-source";
import { Reservation } from "../../entities/reservation.entity";
import { RoomType } from "../../entities/roomType.entity";
import { AppError } from "../../errors/appError";

export const getMinAndMaxDates = (reservationArray: Reservation[]) => {
  let minCheckin = reservationArray[0].checkin;
  let maxCheckout = reservationArray[0].checkout;
  for (let i = 1; i < reservationArray.length; i++) {
    const reservation = reservationArray[i];
    if (reservation.checkin.getTime() < minCheckin.getTime()) {
      minCheckin = reservation.checkin;
    }
    if (reservation.checkout.getTime() > maxCheckout.getTime()) {
      maxCheckout = reservation.checkout;
    }
  }
  return [minCheckin, maxCheckout];
};

export const getDatesInRange = (minDate: Date, maxDate: Date): Date[] => {
  const dates: Date[] = [minDate];
  let currDate = minDate;
  while (currDate.getTime() < maxDate.getTime()) {
    // adiciona um dia
    currDate.setDate(currDate.getDate() + 1);

    dates.push(currDate);
  }

  return dates;
};

export const getAllReservationsOfAGivenRoomType = async (
  roomTypeId: string
) => {
  const reservationsRepository = AppDataSource.getRepository(Reservation);
  const allReservations = await reservationsRepository.find({
    relations: {
      reservation_pets: true,
    },
  });

  const reservationsOfSameRoomType = allReservations.filter((reservation) => {
    const reservationRoomsTypesIds = reservation.reservation_pets.map(
      (reservationPet) => reservationPet.room.room_type.id
    );

    return reservationRoomsTypesIds.includes(roomTypeId);
  }); // todas as reservas que incluem tal quarto privativo

  return reservationsOfSameRoomType;
};

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

export const existsAvailableRoom = async (
  date: Date,
  roomTypeId: string
): Promise<boolean> => {
  const reservationsOfSameRoomType = await getAllReservationsOfAGivenRoomType(
    roomTypeId
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

const roomsDatesService = async (room_type_id: string) => {
  // retorna um array com todas as datas em que não há NENHUM quarto do tipo desejado diponível

  const roomTypesRepository = AppDataSource.getRepository(RoomType);
  const roomType = await roomTypesRepository.findOneBy({
    id: room_type_id,
  });

  if (!roomType) throw new AppError("Invalid room type");

  const reservationsOfSameRoomType = await getAllReservationsOfAGivenRoomType(
    room_type_id
  );

  const [minCheckin, maxCheckout] = getMinAndMaxDates(
    reservationsOfSameRoomType
  );

  const allDates = getDatesInRange(minCheckin, maxCheckout);

  if (roomType.title === "Quarto Compartilhado") {
    const sharedRoomCapacity = roomType.capacity;

    const dates = allDates.filter(async (date) => {
      const numOfPets = await numberOfPetsInSharedRoom(date);
      return numOfPets < sharedRoomCapacity;
    });

    return dates;
  }

  const dates = allDates.filter(
    async (date) => await existsAvailableRoom(date, room_type_id)
  );

  return dates;
};

export default roomsDatesService;
