import { IService } from "./../services/index";
import { IRoom } from "./../rooms/index";

export interface IReservationRequest {
	checkin: string;
	checkout: string;
	services?: IService[];
	pet_rooms: IRoom[];
}

export interface IReservation extends IReservationRequest {
	id: string;
	created_at: string;
	updated_at: string;
}
