import { Request, Response } from "express";
import UserLoginService from "../../services/users/userLogin.service";

const UserLoginController = async (req: Request, res: Response) => {
	const { email, password } = req.body;
	const token = await UserLoginService({ email, password });
	return res.status(200).json({ token });
};

export default UserLoginController;
