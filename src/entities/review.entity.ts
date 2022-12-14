import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	OneToOne,
	ManyToOne,
	JoinColumn,
} from "typeorm";
import { Reservation } from "./reservation.entity";
import { User } from "./user.entity";

@Entity("reviews")
export class Review {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column()
	review_text: string;

	@Column({ type: "decimal", precision: 2, scale: 1, nullable: true })
	stars: number;

	@OneToOne(() => Reservation, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	reservation: Reservation;

	@ManyToOne(() => User, (user) => user.reviews, {
		onDelete: "CASCADE",
	})
	user: User;
}
