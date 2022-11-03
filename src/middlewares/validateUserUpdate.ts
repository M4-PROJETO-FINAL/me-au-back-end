import { IUserUpdate } from "../interfaces/users";
import { Request, Response, NextFunction } from "express";

import * as yup from "yup";

import { SchemaOf } from "yup";
import { AppError } from "../errors/appError";

export const userUpdateSchema: SchemaOf<IUserUpdate> = yup.object().shape({
	name: yup.string(),
	email: yup.string().email(),
	password: yup.string(),
	cpf: yup.string(),
	profile_img: yup.string(),
});

export const validateUserUpdate = (schema: SchemaOf<IUserUpdate>) => {
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const userInfo = req.body;
			if (userInfo.id != undefined)
				throw new AppError("Not possible to update user id", 401);
			if (userInfo.is_adm != undefined)
				throw new AppError("Not possible to update is_adm", 401);

			try {
				const validatedUserInfo = await schema.validate(userInfo, {
					abortEarly: false,
					stripUnknown: true,
				});
				req.newUserUpdate = validatedUserInfo;
				next();
			} catch (err: any) {
				return res.status(400).json({
					error: err.errors?.join(", "),
				});
			}
		} catch (error) {
			next();
		}
	};
};
