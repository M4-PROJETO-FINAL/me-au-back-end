import { IUserRequest, IUserUpdate } from "../interfaces/users";
import { Request, Response, NextFunction } from "express";

import * as yup from "yup";

import { SchemaOf } from "yup";
import { AppError } from "../errors/appError";

export const userCreateSchema: SchemaOf<IUserRequest> = yup.object().shape({
	name: yup.string().required(),
	email: yup.string().required().email(),
	password: yup.string().required(),
	is_adm: yup.boolean(),
	cpf: yup.string(),
	profile_img: yup.string(),
});

export const userUpdateSchema: SchemaOf<IUserUpdate> = yup.object().shape({
	name: yup.string(),
	email: yup.string().email(),
	password: yup.string(),
	cpf: yup.string(),
	profile_img: yup.string(),
});

export const validateUserCreate =
	(schema: SchemaOf<IUserRequest>) =>
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const userInfo = req.body;

			try {
				const validatedUserInfo = await schema.validate(userInfo, {
					abortEarly: false,
					stripUnknown: true,
				});
				req.newUser = validatedUserInfo;
				next();
			} catch (err: any) {
				return res.status(400).json({
					message: err.errors?.join(", "),
				});
			}
		} catch (error) {
			next();
		}
	};
