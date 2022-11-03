import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { ReservationPet } from "./reservationPet.entity";
import { ReservationService } from "./reservationService.entity";
import { Review } from "./review.entity";
import { User } from "./user.entity";

@Entity("reservations")
export class Reservation {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  checkin: Date;

  @Column()
  checkout: Date;

  @Column({ default: "reserved" })
  status: "reserved" | "active" | "concluded" | "cancelled";

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => Review, {
    nullable: true,
  })
  @JoinColumn()
  review: Review;

  @ManyToOne(() => User, (user) => user.reservations)
  user: User;

  @OneToMany(
    () => ReservationPet,
    (reservation_pet) => reservation_pet.reservation
  )
  reservation_pets: ReservationPet[];

  @OneToMany(
    () => ReservationService,
    (reservation_service) => reservation_service.reservation
  )
  reservation_services: ReservationService[];
}
