import { instanceToPlain } from "class-transformer";
import { Request, Response } from "express";
import userVerifyPwService from "../../services/users/userVerifyPw.service";


const UserVerifyPwController = async (req: Request, res: Response) => {
	const { code } = req.body;
	const userCode = await userVerifyPwService({ code });
	return res.status(200).send(instanceToPlain(userCode))
};


export default UserVerifyPwController;