import { Request, Response } from "express";
import petDeleteService from "../../services/pets/petDelete.service";

const petDeleteController = async (req: Request, res: Response) => {
  const petId = req.params.id;
  const userId = req.user.id;
  const is_adm = req.user.is_adm;

  await petDeleteService(petId, userId, is_adm);
  return res.status(204).json();
};

export default petDeleteController;
