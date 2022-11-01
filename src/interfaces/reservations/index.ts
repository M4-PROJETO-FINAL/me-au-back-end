import { IService } from "./../services/index";
import { IPetRoom } from "./../rooms/index";

export interface IReservationRequest {
  checkin: string;
  checkout: string;
  services: IService[];
  pet_rooms: IPetRoom[];
}

export interface IReservation extends IReservationRequest {
  id: string;
  created_at: string;
  updated_at: string;
}
