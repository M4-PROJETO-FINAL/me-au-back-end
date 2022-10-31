import AppDataSource from "../../data-source";
import { Pet } from "../../entities/pet.entity";
import { User } from "../../entities/user.entity";
import { AppError } from "../../errors/appError";
import { IEditPet } from "../../interfaces/pets";

const petUpdateService = async (
  newPetData: IEditPet,
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
    await petRepository.update(petId, {
      name: newPetData.name,
      vaccinated: newPetData.vaccinated,
      neutered: newPetData.neutered,
      docile: newPetData.docile,
    });
  } else if (is_adm) {
    await petRepository.update(petId, {
      name: newPetData.name,
      vaccinated: newPetData.vaccinated,
      neutered: newPetData.neutered,
      docile: newPetData.docile,
    });
  } else {
    throw new AppError("You don't have permission", 403);
  }

  const pet = await petRepository.findOneBy({ id: petId });

  return pet;
};

export default petUpdateService;
