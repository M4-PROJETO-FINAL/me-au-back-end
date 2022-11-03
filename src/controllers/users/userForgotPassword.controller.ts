import { instanceToPlain } from "class-transformer";
import { Request, Response } from "express";
import userForgotPasswordService from "../../services/users/userForgotPassword.service";


const UserForgotPasswordController = async (req: Request, res: Response) => {
	const { email } = req.body;
	console.log(email)
	const userEmail = await userForgotPasswordService({ email });
	return res.status(200).send(instanceToPlain(userEmail))
};


export default UserForgotPasswordController;