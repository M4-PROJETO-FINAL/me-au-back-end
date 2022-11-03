import { instanceToPlain } from "class-transformer";
import { Request, Response } from "express";
import userGetService from "../../services/users/userGet.service";

const UserGetController = async (req: Request, res: Response) => {
	const { id, is_adm } = req.user;
	const userData = await userGetService({ id, is_adm });
	return res.status(200).json(instanceToPlain(userData));
};

export default UserGetController;
