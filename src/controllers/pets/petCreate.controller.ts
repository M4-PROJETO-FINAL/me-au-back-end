import { Request, Response } from "express";
import { IPetRequest } from "../../interfaces/pets";
import petCreateService from "../../services/pets/petCreate.service";
import { instanceToPlain } from "class-transformer";

const petCreateController = async (req: Request, res: Response) => {
	const newPetData: IPetRequest = req.body;
	const userId = req.user.id;
	const newPet = await petCreateService(newPetData, userId);
	return res.status(201).json(instanceToPlain(newPet));
};

export default petCreateController;
