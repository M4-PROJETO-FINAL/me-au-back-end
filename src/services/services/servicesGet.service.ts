import AppDataSource from '../../data-source';
import { Service } from '../../entities/service.entity';

const servicesGetService = async () => {
	const servicesRepository = AppDataSource.getRepository(Service);

	const services = await servicesRepository.find();

	return services;
};

export default servicesGetService;
