import { User } from "./../../entities/user.entity";
import AppDataSource from "../../data-source";
import { IUserUpdate } from "./../../interfaces/users/index";
import { AppError } from "../../errors/appError";

interface IUserUpdateProps extends IUserUpdate {
	id: string;
	is_adm: boolean;
}

const userUpdateService = async ({
	id,
	email,
	name,
	cpf,
	profile_img,
	is_adm,
}: IUserUpdateProps) => {
	const userRepository = AppDataSource.getRepository(User);
	if (is_adm) throw new AppError("Not possible to update is_adm", 401);
	await userRepository.update(id, {
		email,
		name,
		cpf,
		profile_img,
	});
	const userUpdated = userRepository.findOneBy({ id });
	return userUpdated;
};

export default userUpdateService;
