import { instanceToPlain } from "class-transformer";
import { Request, Response } from "express";
import userResetPasswordService from "../../services/users/userResetPassword.service";


const UserResetPasswordController = async (req: Request, res: Response) => {
	const newPassword = req.body;
    const { code } = req.params
	const userPassword = await userResetPasswordService(newPassword, code);
	return res.status(200).send(userPassword)
};


export default UserResetPasswordController;