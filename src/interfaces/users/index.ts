import { IReservation } from "../reservations";
import { IPet } from "./../pets/index";
import { IReview } from "./../reviews/index";

export interface IUserRequest {
	name: string;
	email: string;
	password: string;
	is_adm?: boolean;
	cpf?: string;
	profile_img?: string;
}

export interface IUser {
	id: string;
	name: string;
	email: string;
	password: string;
	cpf?: string;
	profile_img?: string;
	review: IReview;
	pets: IPet[];
	reservations: IReservation[];
}

export interface IUserLogin {
	email: string;
	password: string;
}

export interface IUserUpdate {
	name?: string;
	email?: string;
	password?: string;
	profile_img?: string;
	cpf?: string;
}
