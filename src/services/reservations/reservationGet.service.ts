import AppDataSource from "../../data-source";
import { Reservation } from "../../entities/reservation.entity";

const reservationGetService = async () => {
    const reservationRepository = AppDataSource.getRepository(Reservation);

    const repository = await reservationRepository.find();

    return repository
}

export default reservationGetService