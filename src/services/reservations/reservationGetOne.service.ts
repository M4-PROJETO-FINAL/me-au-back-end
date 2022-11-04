import AppDataSource from '../../data-source';
import { Reservation } from '../../entities/reservation.entity';
import { User } from '../../entities/user.entity';

const reservationGetOneService = async (id: string) => {
	const reservationRepository = AppDataSource.getRepository(Reservation);

	const reservation = await reservationRepository.find({
		where: {
			id: id,
		},
		relations: {
			user: true,
			reservation_pets: true,
			reservation_services: true,
		},
	});

	return reservation;
};

export default reservationGetOneService;
