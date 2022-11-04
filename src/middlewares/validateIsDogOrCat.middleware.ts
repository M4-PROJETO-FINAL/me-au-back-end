import { Request, Response, NextFunction } from "express";
import AppDataSource from "../data-source";
import { Pet } from "../entities/pet.entity";
import { RoomType } from "../entities/roomType.entity";
import { AppError } from "../errors/appError";

const validateIsCatOrDogMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const petRepository = AppDataSource.getRepository(Pet);
  const roomRepository = AppDataSource.getRepository(RoomType);

  const pets = await petRepository.find();
  const rooms = await roomRepository.find();

  const { pet_rooms } = req.body;

  for (let i = 0; i < pet_rooms.length; i++) {
    const IdPet = pet_rooms[i].pet_id;
    const IdRoom = pet_rooms[i].room_type_id;

    const petFound = pets.find((pet) => pet.id === IdPet);
    const roomFound = rooms.find((room) => room.id === IdRoom);

    if (!petFound) throw new AppError("Pet not found", 404);

    if (!roomFound) throw new AppError("Room not found", 404);

    if (petFound.type === "dog" && roomFound.title.includes("gatos")) {
      throw new AppError("Pet incompatible with the room", 400);
    }

    if (
      (petFound.type === "cat" && roomFound.title.includes("cães")) ||
      roomFound.title.includes("Compartilhado")
    ) {
      throw new AppError("Pet incompatible with the room", 400);
    }
  }
  next();
};

export default validateIsCatOrDogMiddleware;
