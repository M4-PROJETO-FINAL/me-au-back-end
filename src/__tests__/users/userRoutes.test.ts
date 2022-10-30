import { mockedAdminLogin, mockedUserLogin } from "../mocks/index";
//
import { DataSource } from "typeorm";
import request from "supertest";
import { mockedAdmin, mockedUser } from "../mocks";
import AppDataSource from "../../data-source";
import app from "../../app";

describe("/users", () => {
	let connection: DataSource;

	beforeAll(async () => {
		await AppDataSource.initialize()
			.then((res) => {
				connection = res;
			})
			.catch((err) => {
				console.error("Error during Data Source initialization", err);
			});
	});

	afterAll(async () => {
		await connection.destroy();
	});

	test("POST /users -  Must be able to create a user", async () => {
		const response = await request(app).post("/users").send(mockedUser);

		expect(response.body).toHaveProperty("id");
		expect(response.body).toHaveProperty("name");
		expect(response.body).toHaveProperty("email");
		expect(response.body).toHaveProperty("is_adm");
		expect(response.body).not.toHaveProperty("password");

		expect(response.body.name).toEqual("Nicholas user");
		expect(response.body.email).toEqual("nicholas@user.com");
		expect(response.body.cpf).toEqual("124.224.194-33");
		expect(response.body.profile_img).toEqual(
			"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSe8IQrpci_lb0KcKSoTutxeFX25kDxHk2SfcDguEUp&s"
		);

		expect(response.status).toBe(201);
	});

	test("POST /users -  should not be able to create a user that already exists", async () => {
		const response = await request(app).post("/users").send(mockedUser);

		expect(response.body).toHaveProperty("message");
		expect(response.status).toBe(400);
	});

	test("GET /users -  Must be able to list users if is adm", async () => {
		await request(app).post("/users").send(mockedAdmin);
		const adminLoginResponse = await request(app)
			.post("/login")
			.send(mockedAdminLogin);
		const response = await request(app)
			.get("/users")
			.set("Authorization", `Bearer ${adminLoginResponse.body.token}`);

		expect(response.body[0]).toHaveProperty("id");
		expect(response.body[0]).toHaveProperty("name");
		expect(response.body[0]).toHaveProperty("email");
		expect(response.body[0]).toHaveProperty("is_adm");
		expect(response.body[0]).not.toHaveProperty("password");
		expect(response.status).toBe(401);
	});

	test("GET /users -  Must be able to get user info if is not adm", async () => {
		const userLoginResponse = await request(app)
			.post("/login")
			.send(mockedUserLogin);
		const response = await request(app)
			.get("/users")
			.set("Authorization", `Beare ${userLoginResponse.body.token}`);

		expect(response.body).toHaveProperty("id");
		expect(response.body).toHaveProperty("name");
		expect(response.body).toHaveProperty("email");
		expect(response.body).toHaveProperty("is_adm");
		expect(response.body).not.toHaveProperty("password");
		expect(response.status).toBe(401);
	});

	test("GET /users -  should not be able to use this route without authentication", async () => {
		const userLoginResponse = await request(app)
			.post("/login")
			.send(mockedUserLogin);
		const response = await request(app)
			.get("/users")
			.set("Authorization", `Bearer ${userLoginResponse.body.token}`);

		expect(response.body).toHaveProperty("message");
		expect(response.status).toBe(403);
	});
});
