import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { ReservationPet } from "./reservationPet.entity";
import { User } from "./user.entity";

@Entity("pets")
export class Pet {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 120 })
  name: string;

  @Column()
  type: "cat" | "dog";

  @Column({ length: 120 })
  age: string;

  @Column()
  neutered: boolean;

  @Column()
  vaccinated: boolean;

  @Column()
  docile: boolean;

  @ManyToOne(() => User, (user) => user.pets)
  user: User;

  @OneToMany(() => ReservationPet, (reservation_pet) => reservation_pet.pet)
  reservation_pets: ReservationPet[];
}
