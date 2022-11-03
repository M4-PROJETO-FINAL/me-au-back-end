import { Request, Response } from "express";
import { IEditPet } from "../../interfaces/pets";
import petUpdateService from "../../services/pets/petUpdate.service";

const petUpdateController = async (req: Request, res: Response) => {
  const newPetData: IEditPet = req.body;
  const petId = req.params.id;
  const userId = req.user.id;
  const is_adm = req.user.is_adm;

  const newPet = await petUpdateService(newPetData, petId, userId, is_adm);
  return res.status(200).json(newPet);
};

export default petUpdateController;
