import { instanceToPlain } from "class-transformer";
import AppDataSource from "../../data-source";
import { Pet } from "../../entities/pet.entity";
import { User } from "../../entities/user.entity";
import { AppError } from "../../errors/appError";
import { IPet, IPetAdminResponse } from "../../interfaces/pets";

const petGetService = async (userId: string, isAdm: boolean) => {
  const petRepository = AppDataSource.getRepository(Pet);
  const userRepository = AppDataSource.getRepository(User);
  const owner = await userRepository.findOneBy({ id: userId });
  if (!owner) throw new AppError("Logged in user doesn't exist (impossible)");

  let pets: IPet[];
  if (isAdm) {
    pets = await petRepository.find({
      relations: {
        user: true,
      },
    });
    const treatedPets: IPetAdminResponse[] = pets.map((pet) => {
      let newPet: IPetAdminResponse;
      newPet = { ...pet, owner: instanceToPlain(pet.user) as User };
      delete newPet.user;
      return newPet;
    });
    return treatedPets;
  }
  pets = await petRepository.find({
    where: {
      user: owner,
    },
  });
  return pets;
};

export default petGetService;
