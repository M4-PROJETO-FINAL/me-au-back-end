import AppDataSource from "../../data-source";
import { Pet } from "../../entities/pet.entity";
import { User } from "../../entities/user.entity";
import { AppError } from "../../errors/appError";
import { IPetRequest } from "../../interfaces/pets";

const petCreateService = async (newPetData: IPetRequest, userId: string) => {
  const petRepository = AppDataSource.getRepository(Pet);
  const userRepository = AppDataSource.getRepository(User);

  const owner = await userRepository.findOneBy({ id: userId });

  if (!owner) throw new AppError("Logged in user doesn't exist (impossible)");

  const newPet = petRepository.create(newPetData);
  newPet.user = owner;
  await petRepository.save(newPet);
  return newPet;
};

export default petCreateService;
