import { Request, Response } from "express";
import roomTypesGetService from "../../services/rooms/roomTypesGet.service";

const roomTypesGetController = async (req: Request, res: Response) => {
  const roomTypes = await roomTypesGetService();
  return res.json(roomTypes);
};

export default roomTypesGetController;
