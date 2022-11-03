import AppDataSource from '../../data-source';
import { Reservation } from '../../entities/reservation.entity';
import { IReservationResponse } from '../../interfaces/reservations';

const reservationGetService = async ()=> {
	const reservationRepository = AppDataSource.getRepository(Reservation);

	const reservation = await reservationRepository.find();

	return reservation;
};

export default reservationGetService;
