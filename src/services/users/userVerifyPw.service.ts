import { User } from "./../../entities/user.entity";
import AppDataSource from "../../data-source";
import { AppError } from "../../errors/appError";

interface IUserVerifyPwProps {
    code: number
}

const userVerifyPwService = async ({ code }: IUserVerifyPwProps) => {
	const userRepository = AppDataSource.getRepository(User);
    const userCode = await userRepository.findOneBy({reset_password_token: code.toString()})
	
    if(!userCode) {
        throw new AppError("Cannot be processed", 400)
    }

    if(code !== +userCode.reset_password_token){
        throw new AppError("Invalid code", 401)
    }

    return userCode
};

export default userVerifyPwService;