import { DataSource } from 'typeorm';
import request from 'supertest';
import AppDataSource from '../../data-source';
import app from '../../app';
import { v4 as uuid } from 'uuid';

describe('/services', () => {
	let connection: DataSource;

	beforeAll(async () => {
		await AppDataSource.initialize()
			.then((res) => {
				connection = res;
			})
			.catch((err) => {
				console.error('Error during Data Source initialization', err);
			});

		const queryRunner = AppDataSource.createQueryRunner();

		await queryRunner.manager.query(
			`INSERT INTO "services" ("id", "name", "description", "price") 
			VALUES 
			('${uuid()}', 'Vacina', 'Vacinação para seu pet, com preço a combinar (dependendo de qual a vacina)', 0), 
			('${uuid()}', 'Banho', 'Banho para deixar o seu pet cheirosinho!', 30), 
			('${uuid()}', 'Tosa', 'Tosa completa para deixar seu pet no estilo', 30), 
			('${uuid()}', 'Massagem', 'Uma sessão relaxante de massagem', 60), 
			('${uuid()}', 'Natação', 'Aula de natação em uma piscina enorme e aquecida', 50), 
			('${uuid()}', 'Ração', 'Uma porção de ração premium gourmet', 10)`
		);
	});

	afterAll(async () => {
		await connection.destroy();
	});

	test('GET /services - Should be able to list all services', async () => {
		const response = await request(app).get('/services');

		expect(response.body[0]).toHaveProperty('id');
		expect(response.body[0]).toHaveProperty('name');
		expect(response.body[0]).toHaveProperty('description');
		expect(response.body[0]).toHaveProperty('price');
		expect(response.body).toHaveLength(6);
		expect(response.status).toBe(200);
	});
});
