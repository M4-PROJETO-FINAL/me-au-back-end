import { User } from "../../entities/user.entity";
import { IUserRequest } from "../../interfaces/users";
import bcrypt from "bcrypt";
import AppDataSource from "../../data-source";
import { AppError } from "../../errors/appError";

const userCreateService = async ({
	email,
	name,
	password,
	cpf,
	is_adm,
	profile_img,
}: IUserRequest): Promise<IUserRequest> => {
	const userRepository = AppDataSource.getRepository(User);
	const userAlreadyExists = await userRepository.findOneBy({
		email,
	});
	if (userAlreadyExists) {
		throw new AppError("Email already exists");
	}
	const user = new User();

	user.name = name;
	user.is_adm = is_adm || false;
	user.email = email;
	user.password = bcrypt.hashSync(password, 10);
	if (cpf) user.cpf = cpf;
	if (profile_img) user.profile_img = profile_img;

	userRepository.create(user);
	const newUser = await userRepository.save(user);

	return newUser;
};

export default userCreateService;
