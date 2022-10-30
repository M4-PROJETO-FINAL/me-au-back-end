import { instanceToPlain } from "class-transformer";
import { Request, Response } from "express";
import userCreateService from "../../services/users/userCreate.service";

const userCreateController = async (req: Request, res: Response) => {
	const { email, name, password, cpf, is_adm, profile_img } = req.newUser;
	const newUser = await userCreateService({
		email,
		name,
		password,
		cpf,
		is_adm,
		profile_img,
	});
	return res.status(201).json(instanceToPlain(newUser));
};

export default userCreateController;
