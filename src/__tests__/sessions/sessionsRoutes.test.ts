import request from "supertest";
import { DataSource } from "typeorm";
import app from "../../app";
import AppDataSource from "../../data-source";
import { mockedUser, mockedUserLogin } from "../mocks";

describe("/users", () => {
	let connection: DataSource;

	beforeAll(async () => {
		await AppDataSource.initialize()
			.then((res) => (connection = res))
			.catch((err) =>
				console.error("Error during Data Source initialization", err)
			);
	});

	afterAll(async () => {
		await connection.destroy();
	});

	test("POST /users - Should be able to login with the user", async () => {
		const createdUser = await request(app).post("/users").send(mockedUser);
		const response = await request(app).post("/login").send(mockedUserLogin);

		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty("token");
	});

	test("POST /users Should not be able to login with a incorrect email", async () => {
		const response = await request(app).post("/login").send({
			email: "wrong.email@user.com",
			password: "passw23#W",
		});
		expect(response.status).toBe(403);
		expect(response.body).toHaveProperty("message");
	});

	test("POST /users Should not be able to login with a incorrect password", async () => {
		const response = await request(app).post("/login").send({
			email: "nicholas@user.com",
			password: "wrongPassword@1",
		});
		expect(response.status).toBe(403);
		expect(response.body).toHaveProperty("message");
	});
});
