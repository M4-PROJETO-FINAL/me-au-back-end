import { Reservation } from '../../entities/reservation.entity';
import AppDataSource from '../../data-source';
import { AppError } from '../../errors/appError';

const reservationDeleteService = async (id: string): Promise<Reservation> => {
	const reservationRepository = AppDataSource.getRepository(Reservation);

	const reservation = await reservationRepository.findOneBy({ id });

	if (!reservation) {
		throw new AppError('Reservation not found', 404);
	}
	//more to be added
	await reservationRepository.update(reservation!.id, {
		status: (reservation!.status = 'cancelled'),
	});

	return reservation!;
};

export default reservationDeleteService;
