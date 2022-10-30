import { User } from "./../../entities/user.entity";
import AppDataSource from "../../data-source";
import { IUserUpdate } from "./../../interfaces/users/index";

interface IUserUpdateProps extends IUserUpdate {
	id: string;
}

const userUpdateService = async ({
	id,
	email,
	name,
	cpf,
	profile_img,
}: IUserUpdateProps) => {
	const userRepository = AppDataSource.getRepository(User);
	const userUpdated = await userRepository.update(id, {
		email,
		name,
		cpf,
		profile_img,
	});
	return userUpdated;
};

export default userUpdateService;
