import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { Pet } from "./pet.entity";
import { Reservation } from "./reservation.entity";
import { Review } from "./review.entity";
import { Exclude } from "class-transformer";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 120 })
  name: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ length: 120 })
  email: string;

  @Column({ default: false })
  is_adm: boolean;

  @Column({ nullable: true })
  cpf: string;

  @Column({ nullable: true })
  profile_img: string;

  @OneToOne(() => Review)
  @JoinColumn()
  review: Review;

  @OneToMany(() => Pet, (pet) => pet.user)
  pets: Pet[];

  @OneToMany(() => Reservation, (reservation) => reservation.user)
  reservations: Reservation[];
}
