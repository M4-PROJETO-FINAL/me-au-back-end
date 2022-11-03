import { Reservation } from '../../entities/reservation.entity';
import AppDataSource from '../../data-source';

const reservationDeleteService = async (id: string): Promise<Reservation> => {
	const reservationRepository = AppDataSource.getRepository(Reservation);

	const reservation = await reservationRepository.findOneBy({ id });

	await reservationRepository.update(reservation!.id, {
		status: (reservation!.status = 'cancelled'),
	});

	return reservation!;
};

export default reservationDeleteService;
