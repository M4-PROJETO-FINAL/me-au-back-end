import AppDataSource from "../../data-source";
import { RoomType } from "../../entities/roomType.entity";
import { AppError } from "../../errors/appError";
import { getDatesInRange, getMinAndMaxDates } from "./auxiliaryFunctions/dates";
import {
  existsAvailableRoom,
  getAllReservationsOfAGivenRoomType,
  numberOfPetsInSharedRoom,
} from "./auxiliaryFunctions/roomAvailability";

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

    const sharedRoomPopulation = await Promise.all(
      allDates.map((date) => numberOfPetsInSharedRoom(date))
    );

    const dates = allDates.filter((date, idx) => {
      return sharedRoomPopulation[idx] >= sharedRoomCapacity;
    });

    return dates;
  }

  const roomAvailability = await Promise.all(
    allDates.map((date) => existsAvailableRoom(date, room_type_id))
  );

  const dates = allDates.filter((date, idx) => !roomAvailability[idx]);

  return dates;
};

export default roomsDatesService;
