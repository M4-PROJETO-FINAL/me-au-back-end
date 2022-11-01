import { Request, Response } from "express";
import roomsDatesService from "../../services/rooms/roomsDates.service";

const roomsDatesController = async (req: Request, res: Response) => {
  const { room_type_id } = req.params;
  const dates = await roomsDatesService(room_type_id);

  return res.json(dates);
};

export default roomsDatesController;
