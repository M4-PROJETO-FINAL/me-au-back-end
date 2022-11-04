import { IService } from './../services/index';
import { IPetRoom } from './../rooms/index';

export interface IReservationRequest {
	checkin: string;
	checkout: string;
	services?: IService[];
	pet_rooms: IPetRoom[];
}

export interface IReservationCreate extends IReservationRequest {
	user_id: string;
}

export interface IReservation extends IReservationRequest {
	id: string;
	created_at: string;
	updated_at: string;
}

export interface IReservationPetRoom {
	pet_id: string;
	room_type_id: string;
}

export interface IServicesReservation {
	service_id: string;
	amount: number;
}
export interface IReservationResponse {
	id: string;
	status: 'reserved' | 'active' | 'concluded' | 'cancelled';
	created_at: Date;
	updated_at: Date;
	checkin: Date;
	checkout: Date;
	pet_rooms: IPetRoom[];
	services: IService[];
}