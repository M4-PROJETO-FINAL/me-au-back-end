import AppDataSource from '../../data-source';
import { Reservation } from '../../entities/reservation.entity';

const reservationGetOneService = async (id: string) => {
	const reservationRepository = AppDataSource.getRepository(Reservation);

	const reservation = await reservationRepository.find();

	const userReservation = reservation.find(
		(reservation) => reservation.id === id
	);

	console.log(userReservation);

	return userReservation;
};

export default reservationGetOneService;
