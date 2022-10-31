import { Request, Response } from 'express';
import servicesGetService from '../../services/services/servicesGet.service';

const servicesGetController = async (req: Request, res: Response) => {
	const services = await servicesGetService();

	return res.status(200).json(services);
};

export default servicesGetController;
