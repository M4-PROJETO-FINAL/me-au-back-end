import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import AppDataSource from "../../data-source";
import { AppError } from "../../errors/appError";
import { IUserLogin } from "./../../interfaces/users/index";
import { User } from "../../entities/user.entity";

const UserLoginService = async ({
	email,
	password,
}: IUserLogin): Promise<string> => {
	const userRepository = AppDataSource.getRepository(User);

	const user = await userRepository.findOneBy({ email });
	if (!user) throw new AppError("Wrong e-mail or password.", 403);

	if (!bcrypt.compareSync(password, user.password))
		throw new AppError("Wrong e-mail or password.", 403);

	const token = jwt.sign(
		{
			is_adm: user.is_adm,
		},
		String(process.env.SECRET_KEY),
		{
			subject: user.id,
			expiresIn: "30days",
		}
	);

	return token;
};

export default UserLoginService;
