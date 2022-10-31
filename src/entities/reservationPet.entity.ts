import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Pet } from "./pet.entity";
import { Reservation } from "./reservation.entity";
import { Room } from "./room.entity";

@Entity("reservation_pets")
export class ReservationPet {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Pet, (pet) => pet.reservation_pets)
  pet: Pet;

  @ManyToOne(() => Reservation, (reservation) => reservation.reservation_pets)
  reservation: Reservation;

  @ManyToOne(() => Room, (room) => room.reservation_pets)
  room: Room;
}
