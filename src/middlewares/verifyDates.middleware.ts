import { Request, Response, NextFunction } from "express";
import AppDataSource from "../data-source";
import { Reservation } from "../entities/reservation.entity";
import { Room } from "../entities/room.entity";
import { RoomType } from "../entities/roomType.entity";
import { AppError } from "../errors/appError";
import { IPetRoom } from "../interfaces/rooms";
import roomsDatesService from "../services/rooms/roomsDates.service";

const verifyDates = async (req: Request, res: Response, next: NextFunction) => {
  // lança um erro quando um dos tipos de quarto desejado não possui disponibilidade no intervalo de datas desejado

  const { checkin, checkout } = req.body;
  const checkinTs = new Date(checkin).getTime();
  const checkoutTs = new Date(checkout).getTime();
  const petRooms: IPetRoom[] = req.body.pet_rooms;

  const roomTypeIds = new Set(petRooms.map((petRoom) => petRoom.room_type_id));

  for (let roomTypeId of roomTypeIds) {
    const unavailableDates = await roomsDatesService(roomTypeId);

    for (let date of unavailableDates) {
      const dateTs = date.getTime();
      if (dateTs > checkinTs && dateTs < checkoutTs) {
        const roomTypesRepository = AppDataSource.getRepository(RoomType);
        const allRoomTypes = await roomTypesRepository.find();
        const unavailableRoomType = allRoomTypes.find(
          (roomType) => roomType.id === roomTypeId
        )?.title;
        throw new AppError(
          `No available rooms of type '${unavailableRoomType}' in the required timeframe`
        );
      }
    }
  }

  next();
};

export default verifyDates;
