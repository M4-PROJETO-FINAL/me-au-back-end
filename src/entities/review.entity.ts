import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  ManyToOne,
} from "typeorm";
import { Reservation } from "./reservation.entity";
import { User } from "./user.entity";

@Entity("reviews")
export class Review {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  review_text: string;

  @Column()
  stars: number;

  @OneToOne(() => Reservation, {
    nullable: true,
  })
  reservation: Reservation;

  @ManyToOne(() => User, (user) => user.reviews, {
    nullable: true,
  })
  user: User;
}
