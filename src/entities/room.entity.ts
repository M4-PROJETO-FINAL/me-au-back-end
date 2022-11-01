import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
} from "typeorm";
import { ReservationPet } from "./reservationPet.entity";
import { RoomType } from "./roomType.entity";

@Entity("rooms")
export class Room {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @OneToMany(() => ReservationPet, (reservation_pet) => reservation_pet.room)
  reservation_pets: ReservationPet[];

  @ManyToOne(() => RoomType, (room_type) => room_type.rooms)
  room_type: RoomType;
}
