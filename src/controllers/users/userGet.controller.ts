import { Request, Response } from "express";
import userGetService from "../../services/users/userGet.service";

const UserGetController = async (req: Request, res: Response) => {
	const { id, is_adm } = req.user;
	const userData = await userGetService({ id, is_adm });
	return res.status(200).json(userData);
};

export default UserGetController;
