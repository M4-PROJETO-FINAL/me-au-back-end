import { User } from "./../../entities/user.entity";
import AppDataSource from "../../data-source";

interface IUserGetServiceProps {
	id: string;
	is_adm: boolean;
}

const userGetService = async ({ id, is_adm }: IUserGetServiceProps) => {
	const userRepository = AppDataSource.getRepository(User);
	const allUsers = await userRepository.find();

	if (is_adm) return allUsers;

	return allUsers.find((user) => user.id === id);
};

export default userGetService;
