import { Request, Response } from "express";
import roomsGetService from "../../services/rooms/roomsGet.service";

const roomsGetController = async (req: Request, res: Response) => {
  const rooms = await roomsGetService();
  return res.json(rooms);
};

export default roomsGetController;
