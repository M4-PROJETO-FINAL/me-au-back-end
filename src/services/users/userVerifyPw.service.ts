import { User } from "./../../entities/user.entity";
import AppDataSource from "../../data-source";
import { AppError } from "../../errors/appError";
import { sendEmail } from "../../nodemailer.util"
import { IEmailRequest } from "../../interfaces/email"

interface IUserVerifyPwProps {
    code: number
}

const userVerifyPwService = async ({ code }: IUserVerifyPwProps) => {
	const userRepository = AppDataSource.getRepository(User);
    const userCode = await userRepository.findOneBy({reset_password_token: code})
	
    if(!userCode) {
        throw new AppError("Cannot be processed", 400)
    }

    // userCode.reset_password_token = null;
    // userEmail.reset_password_expires = ""

    // await userRepository.save(userCode)

    const user = await userRepository.findOneBy({reset_password_token: code})

    return userCode
};

export default userVerifyPwService;