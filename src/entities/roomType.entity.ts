import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Room } from "./room.entity";

@Entity("room_types")
export class RoomType {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  title: string;

  @Column()
  description: string;

  @Column()
  image: string;

  @Column()
  capacity: number;

  @Column({ type: "decimal", precision: 8, scale: 2 })
  price: number;

  @OneToMany(() => Room, (room) => room.room_type)
  rooms: Room[];
}
