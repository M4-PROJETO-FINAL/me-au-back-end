import { IUser } from "./../../interfaces/users/index";
import { mockedAdminLogin, mockedUserLogin } from "../mocks";
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
		expect(response.status).toBe(200);
	});

	test("GET /users -  Must be able to get user info if is not adm", async () => {
		const userLoginResponse = await request(app)
			.post("/login")
			.send(mockedUserLogin);
		const response = await request(app)
			.get("/users")
			.set("Authorization", `Bearer ${userLoginResponse.body.token}`);

		expect(response.body).toHaveProperty("id");
		expect(response.body).toHaveProperty("name");
		expect(response.body).toHaveProperty("email");
		expect(response.body).toHaveProperty("is_adm");
		expect(response.body).not.toHaveProperty("password");
		expect(response.status).toBe(200);
	});

	test("PATCH /users/:id -  should not to be able to update user with invalid id", async () => {
		const newValuesUser = {
			name: "Joao",
			email: "joao_testing22@gmail.com",
			cpf: "232.323.442-24",
		};
		const adminLoginResponse = await request(app)
			.post("/login")
			.send(mockedAdminLogin);

		const response = await request(app)
			.patch("/users/21332asd-5dbe-423a-23fas-dkfb02sd23cf")
			.set("Authorization", `Bearer ${adminLoginResponse.body.token}`)
			.send(newValuesUser);

		expect(response.body).toHaveProperty("message");
		expect(response.status).toBe(404);
	});

	test("PATCH /users/:id -  should not be able to update user without authentication", async () => {
		const newValuesUser = {
			name: "Joao",
			email: "joao_testing22@gmail.com",
			cpf: "232.323.442-24",
		};
		const adminLoginResponse = await request(app)
			.post("/login")
			.send(mockedAdminLogin);

		const allUsers = await request(app)
			.get("/users")
			.set("Authorization", `Bearer ${adminLoginResponse.body.token}`);
		const userToUpdate = allUsers.body[0];
		const userToUpdateId = userToUpdate.id;

		const response = await request(app)
			.patch(`/users/${userToUpdateId}`)
			.send(newValuesUser);

		expect(response.body).toHaveProperty("message");
		expect(response.status).toBe(401);
	});

	test("PATCH /users/:id -  should not be able to update is_adm field", async () => {
		const newValuesUser = {
			is_adm: true,
		};
		const userLoginResponse = await request(app)
			.post("/login")
			.send(mockedUserLogin);

		const user = await request(app)
			.get("/users")
			.set("Authorization", `Bearer ${userLoginResponse.body.token}`);
		const userToUpdate = user.body;
		const userToUpdateId = userToUpdate.id;

		const response = await request(app)
			.patch(`/users/${userToUpdateId}`)
			.set("Authorization", `Bearer ${userLoginResponse.body.token}`)
			.send(newValuesUser);

		expect(response.body).toHaveProperty("message");
		expect(response.status).toBe(401);
	});

	test("PATCH /users/:id -  should not be able to update another user without adm permission", async () => {
		const newUserToUpdate = {
			name: "Amanda",
			email: "amanda@gmail.com",
			cpf: "444.323.442-24",
			password: "amanda#W",
		};
		const userToUpdate = await request(app)
			.post("/login")
			.send(newUserToUpdate);
		const userToUpdateId = userToUpdate.body.id;

		const newValuesUser = {
			name: "Joao",
			email: "joao_testing22@gmail.com",
			cpf: "232.323.442-24",
		};
		const userLoginResponse = await request(app)
			.post("/login")
			.send(mockedUserLogin);

		const response = await request(app)
			.patch(`/users/${userToUpdateId}`)
			.set("Authorization", `Bearer ${userLoginResponse.body.token}`)
			.send(newValuesUser);

		expect(response.body).toHaveProperty("message");
		expect(response.status).toBe(404);
	});

	test("PATCH /users/:id - should be able to update user", async () => {
		const newValuesUser = {
			name: "Joao",
			email: "joao_testing22@gmail.com",
			cpf: "232.323.442-24",
			profile_img:
				"https://w7.pngwing.com/pngs/431/554/png-transparent-splash-blue-splash-miscellaneous-blue-drop-thumbnail.png",
		};

		const userLoginResponse = await request(app)
			.post("/login")
			.send(mockedUserLogin);

		const userToUpdate = await request(app)
			.get("/users")
			.send(mockedUserLogin)
			.set("Authorization", `Bearer ${userLoginResponse.body.token}`);
		const userToUpdateId = userToUpdate.body.id;

		const response = await request(app)
			.patch(`/users/${userToUpdateId}`)
			.set("Authorization", `Bearer ${userLoginResponse.body.token}`)
			.send(newValuesUser);

		expect(response.body.name).toEqual("Joao");
		expect(response.body.email).toEqual("joao_testing22@gmail.com");
		expect(response.body.cpf).toEqual("232.323.442-24");
		expect(response.body.profile_img).toEqual(
			"https://w7.pngwing.com/pngs/431/554/png-transparent-splash-blue-splash-miscellaneous-blue-drop-thumbnail.png"
		);
		expect(response.status).toBe(200);
	});

	test("DELETE /users/:id - should not be able to delete user without authentication", async () => {
		await request(app).post("/users").send(mockedUser);
		const userLoginResponse = await request(app)
			.post("/login")
			.send(mockedUserLogin);

		const userToDelete = await request(app)
			.get("/users")
			.set("Authorization", `Bearer ${userLoginResponse.body.token}`);
		const userToDeleteId = userToDelete.body.id;

		const response = await request(app).delete(`/users/${userToDeleteId}`);

		expect(response.status).toBe(401);
		expect(response.body).toHaveProperty("message");
	});

	test("DELETE /users/:id - should not be able to delete user not being admin", async () => {
		await request(app).post("/users").send(mockedUser);
		const newUserToDelete = {
			name: "Amanda",
			email: "amanda@gmail.com",
			cpf: "444.323.442-24",
			password: "amanda#W",
		};
		const newUserLoginResponse = await request(app)
			.post("/users")
			.send(newUserToDelete);

		const newUserToDeleteId = newUserLoginResponse.body.id;

		const userLoginResponse = await request(app)
			.post("/login")
			.send(mockedUserLogin);

		const response = await request(app)
			.delete(`/users/${newUserToDeleteId}`)
			.set("Authorization", `Bearer ${userLoginResponse.body.token}`);

		expect(response.status).toBe(403);
	});

	test("DELETE /users/:id - should not be able to delete user with invalid id ", async () => {
		const adminLoginResponse = await request(app)
			.post("/login")
			.send(mockedAdminLogin);

		const response = await request(app)
			.patch("/users/21332asd-5dbe-423a-23fas-dkfb02sd23cf")
			.set("Authorization", `Bearer ${adminLoginResponse.body.token}`);

		expect(response.body).toHaveProperty("message");
		expect(response.status).toBe(404);
	});

	test("DELETE /users/:id - must be able to delete a user ", async () => {
		const adminLoginResponse = await request(app)
			.post("/login")
			.send(mockedAdminLogin);

		const userLoginResponse = await request(app)
			.post("/login")
			.send(mockedUserLogin);

		const userToDelete = await request(app)
			.get("/users")
			.set("Authorization", `Bearer ${userLoginResponse.body.token}`);
		const userToDeleteId = userToDelete.body.id;

		const response = await request(app)
			.delete(`/users/${userToDeleteId}`)
			.set("Authorization", `Bearer ${adminLoginResponse.body.token}`);
		expect(response.status).toBe(204);

		const listUsersResponse = await request(app)
			.get("/users")
			.set("Authorization", `Bearer ${adminLoginResponse.body.token}`);

		const user = listUsersResponse.body.find(
			(user: IUser) => user.id === userToDeleteId
		);

		expect(user).toBe(undefined);
	});
});
