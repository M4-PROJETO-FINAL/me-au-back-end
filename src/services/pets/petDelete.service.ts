import AppDataSource from "../../data-source";
import { Pet } from "../../entities/pet.entity";
import { User } from "../../entities/user.entity";
import { AppError } from "../../errors/appError";

const petDeleteService = async (
  petId: string,
  userId: string,
  is_adm: boolean
) => {
  const petRepository = AppDataSource.getRepository(Pet);
  const userRepository = AppDataSource.getRepository(User);

  const pets = await petRepository.find({ relations: { user: true } });

  const petFound = pets.find((pet) => pet.id === petId);

  if (!petFound) throw new AppError("Pet not found");

  const owner = await userRepository.findOneBy({ id: petFound.user.id });

  if (!owner) throw new AppError("Owner not found");

  if (owner.id === userId) {
    await petRepository.delete(petId);
  } else if (is_adm) {
    await petRepository.delete(petId);
  } else {
    throw new AppError("You don't have permission");
  }
};

export default petDeleteService;
