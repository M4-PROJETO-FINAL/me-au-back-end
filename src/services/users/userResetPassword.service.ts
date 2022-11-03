import { User } from "./../../entities/user.entity";
import AppDataSource from "../../data-source";
import { AppError } from "../../errors/appError";
import bcrypt from "bcrypt";


interface IUserResetPasswordProps {
    new_password: string,
    confirm_password: string
}

const userResetPasswordService = async ({ new_password, confirm_password }: IUserResetPasswordProps, code: string) => {
	const userRepository = AppDataSource.getRepository(User);
    const userCode = await userRepository.findOneBy({reset_password_token: code})
	
    if(new_password !== confirm_password) {
        throw new AppError("Passwords didn't match", 400)
    }

    const hash = bcrypt.hashSync(new_password, 10)

    userCode!.reset_password_token = "";
    userCode!.password = hash;

    //userCode.reset_password_expires = ""

    await userRepository.save(userCode!)

    const user = await userRepository.findOneBy({reset_password_token: code})

    return user
};

export default userResetPasswordService;