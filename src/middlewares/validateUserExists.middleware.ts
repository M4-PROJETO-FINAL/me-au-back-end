import { User } from "./../entities/user.entity";
import { NextFunction, Request, Response } from "express";
import AppDataSource from "../data-source";
import { AppError } from "../errors/appError";

export const validateUserExists = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { id } = req.params;
	const userRepository = AppDataSource.getRepository(User);
	const allUsers = await userRepository.find();
	const user = allUsers.find((u) => u.id === id);
	if (!user) throw new AppError("User id not found", 404);
	next();
};

export default validateUserExists;
