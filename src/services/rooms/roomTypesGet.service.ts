import AppDataSource from "../../data-source";
import { RoomType } from "../../entities/roomType.entity";

const roomTypesGetService = async () => {
  const roomTypeRepository = AppDataSource.getRepository(RoomType);
  const roomTypes = await roomTypeRepository.find();
  return roomTypes;
};

export default roomTypesGetService;
