import { Reservation } from '../../entities/reservation.entity';
import AppDataSource from '../../data-source';
import { AppError } from '../../errors/appError';

interface IReservationDelete {
	id: string;
}

const reservationDeleteService = async ({ id }: IReservationDelete) => {
	const reservationRepository = AppDataSource.getRepository(Reservation);

	const reservations = await reservationRepository.findOneBy({ id });

	if (!reservations) {
		throw new AppError('Reservation does not exists', 404);
	}

	if (reservations.status === 'cancelled') {
		throw new AppError('Reservation does not exists', 400);
	}

	await reservationRepository.update(reservations!.id, {
		status: (reservations!.status = 'cancelled'),
	});

	return reservations!;
};

export default reservationDeleteService;
