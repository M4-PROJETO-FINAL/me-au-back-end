import { Reservation } from '../../entities/reservation.entity';
import AppDataSource from '../../data-source';

const reservationDeleteService = async (id: string): Promise<Reservation> => {
	const reservationRepository = AppDataSource.getRepository(Reservation);

	const reservation = await reservationRepository.findOneBy({ id });

	console.log(reservation);

	await reservationRepository.delete(reservation!);

	return reservation!;
};

export default reservationDeleteService;
