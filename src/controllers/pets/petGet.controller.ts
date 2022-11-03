import { Request, Response } from "express";
import petGetService from "../../services/pets/petGet.service";

const petGetController = async (req: Request, res: Response) => {
  const { is_adm: isAdm, id } = req.user;
  const pets = await petGetService(id, isAdm);
  return res.json(pets);
};

export default petGetController;
