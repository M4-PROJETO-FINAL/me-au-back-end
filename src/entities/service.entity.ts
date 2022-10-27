import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { ReservationService } from "./reservationService.entity";

@Entity("services")
export class Service {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  description: string;

  @Column({ type: "decimal", precision: 8, scale: 2 })
  price: number;

  @OneToMany(
    () => ReservationService,
    (reservation_service) => reservation_service.service
  )
  reservation_services: ReservationService[];
}
