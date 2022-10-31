import AppDataSource from "../../data-source";
import { Room } from "../../entities/room.entity";

const roomsGetService = async () => {
  const roomRepository = AppDataSource.getRepository(Room);
  const rooms = await roomRepository.find();
  return rooms;
};

export default roomsGetService;
