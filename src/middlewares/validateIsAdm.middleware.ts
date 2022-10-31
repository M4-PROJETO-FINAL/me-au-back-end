import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/appError";

const validateIsAdm = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { is_adm } = req.user;
	if (!is_adm)
		throw new AppError("User is forbidden, must be an administrator", 403);
	next();
};

export default validateIsAdm;
