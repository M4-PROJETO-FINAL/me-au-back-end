import AppDataSource from "../../data-source";
import { Room } from "../../entities/room.entity";
import { IRoom } from "../../interfaces/rooms";

const roomsGetService = async () => {
  const roomRepository = AppDataSource.getRepository(Room);
  const rooms = await roomRepository.find({
    relations: {
      room_type: true,
    },
  });
  const treatedRooms: IRoom[] = rooms.map((room) => {
    return {
      id: room.id,
      room_type_id: room.room_type.id,
    };
  });
  return treatedRooms;
};

export default roomsGetService;
