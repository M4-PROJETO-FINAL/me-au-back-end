import { instanceToPlain } from "class-transformer";
import { Request, Response } from "express";
import userUpdateService from "../../services/users/userUpdate.service";

const userUpdateController = async (req: Request, res: Response) => {
	const { id } = req.params;

	const { cpf, email, name, profile_img } = req.body;
	const userDataUpdated = await userUpdateService({
		id,
		email,
		name,
		cpf,
		profile_img,
	});
	return res.status(200).json(instanceToPlain(userDataUpdated));
};

export default userUpdateController;
