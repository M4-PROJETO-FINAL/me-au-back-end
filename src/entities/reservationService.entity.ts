import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Reservation } from "./reservation.entity";
import { Service } from "./service.entity";

@Entity("reservation_services")
export class ReservationService {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  amount: number;

  @ManyToOne(
    () => Reservation,
    (reservation) => reservation.reservation_services,
    {
      onDelete: "CASCADE",
    }
  )
  reservation: Reservation;

  @ManyToOne(() => Service, (service) => service.reservation_services)
  service: Service;
}
