import AppDataSource from '../../data-source';
import { Reservation } from '../../entities/reservation.entity';

const reservationGetService = async () => {
	const reservationRepository = AppDataSource.getRepository(Reservation);

	const reservation = await reservationRepository.find({
		relations: {
			user: true,
			reservation_pets: {
				room: {
					room_type: true,
				},
			},
			reservation_services: {
				service: true,
			},
		},
	});

	const treatedPetRoom = reservation.map((field) => {
		return {
			reservation: reservation.map((field) => {
				return {
					id: field.id,
					checkin: field.checkin,
					checkout: field.checkout,
					status: field.status,
					created_at: field.created_at,
					updated_at: field.updated_at,
					user: field.user,
					pets_rooms: field.reservation_pets.map((pets_info) => {
						return {
							pet_id: pets_info.id,
							rooms_type_id: pets_info.room.room_type.id,
						};
					}),
					services: field.reservation_services.map((service) => {
						return {
							service: service.service,
							amount: service.amount
						}
					})
				};
			}),
		};
	});

	// const reservation = await AppDataSource.getRepository(Reservation)
	// 	.createQueryBuilder('reservation')
	// 	.leftJoinAndSelect('reservation.reservation_pets', 'reservation_pets')
	// 	.leftJoinAndSelect('reservation.reservation_services', 'reservation_services')
	// 	.leftJoinAndSelect('reservation_services.service', 'service')
	// 	.leftJoinAndSelect('reservation_pets.room', 'room')
	// 	.leftJoinAndSelect('room.room_type', 'room_type')
	// 	.getMany();

	return treatedPetRoom[0].reservation
};

export default reservationGetService;

//.select(['reservation.checkin', 'reservation_pets.pet.name'])
