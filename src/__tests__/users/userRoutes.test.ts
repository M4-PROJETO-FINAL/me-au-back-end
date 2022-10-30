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

	test("DELETE /users/:id -  should not be able to delete user without authentication", async () => {
		const adminLoginResponse = await request(app)
			.post("/login")
			.send(mockedAdminLogin);
		const UserToBeDeleted = await request(app)
			.get("/users")
			.set("Authorization", `Bearer ${adminLoginResponse.body.token}`);

		const response = await request(app).delete(
			`/users/${UserToBeDeleted.body[0].id}`
		);

		expect(response.body).toHaveProperty("message");
		expect(response.status).toBe(401);
	});

	test("DELETE /users/:id -  should not be able to delete user not being admin", async () => {
		const userLoginResponse = await request(app)
			.post("/login")
			.send(mockedUserLogin);
		const adminLoginResponse = await request(app)
			.post("/login")
			.send(mockedAdminLogin);
		const UserTobeDeleted = await request(app)
			.get("/users")
			.set("Authorization", `Bearer ${adminLoginResponse.body.token}`);

		const response = await request(app)
			.delete(`/users/${UserTobeDeleted.body[0].id}`)
			.set("Authorization", `Bearer ${userLoginResponse.body.token}`);

		expect(response.body).toHaveProperty("message");
		expect(response.status).toBe(403);
	});

	test("DELETE /users/:id -  Must be able to soft delete user", async () => {
		await request(app).post("/users").send(mockedAdmin);

		const adminLoginResponse = await request(app)
			.post("/login")
			.send(mockedAdminLogin);
		const UserTobeDeleted = await request(app)
			.get("/users")
			.set("Authorization", `Bearer ${adminLoginResponse.body.token}`);

		const response = await request(app)
			.delete(`/users/${UserTobeDeleted.body[0].id}`)
			.set("Authorization", `Bearer ${adminLoginResponse.body.token}`);
		const findUser = await request(app)
			.get("/users")
			.set("Authorization", `Bearer ${adminLoginResponse.body.token}`);
		expect(response.status).toBe(204);
		expect(findUser.body[0].isActive).toBe(false);
	});

	test("DELETE /users/:id -  shouldn't be able to delete user with isActive = false", async () => {
		await request(app).post("/users").send(mockedAdmin);

		const adminLoginResponse = await request(app)
			.post("/login")
			.send(mockedAdminLogin);
		const UserTobeDeleted = await request(app)
			.get("/users")
			.set("Authorization", `Bearer ${adminLoginResponse.body.token}`);

		const response = await request(app)
			.delete(`/users/${UserTobeDeleted.body[0].id}`)
			.set("Authorization", `Bearer ${adminLoginResponse.body.token}`);
		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty("message");
	});

	test("DELETE -  should not be able to delete user with invalid id", async () => {
		await request(app).post("/users").send(mockedAdmin);

		const adminLoginResponse = await request(app)
			.post("/login")
			.send(mockedAdminLogin);

		const response = await request(app)
			.delete(`/users/13970660-5dbe-423a-9a9d-5c23b37943cf`)
			.set("Authorization", `Bearer ${adminLoginResponse.body.token}`);
		expect(response.status).toBe(404);
		expect(response.body).toHaveProperty("message");
	});

	test("PATCH /users/:id -  should not be able to update user without authentication", async () => {
		const adminLoginResponse = await request(app)
			.post("/login")
			.send(mockedAdminLogin);
		const userTobeUpdate = await request(app)
			.get("/users")
			.set("Authorization", `Bearer ${adminLoginResponse.body.token}`);
		const response = await request(app).patch(
			`/users/${userTobeUpdate.body[0].id}`
		);

		expect(response.body).toHaveProperty("message");
		expect(response.status).toBe(401);
	});

	test("PATCH /users/:id - should not be able to update user with invalid id", async () => {
		const newValues = { name: "Joana Brito", email: "joanabrito@mail.com" };

		const admingLoginResponse = await request(app)
			.post("/login")
			.send(mockedAdminLogin);
		const token = `Bearer ${admingLoginResponse.body.token}`;

		const userTobeUpdateRequest = await request(app)
			.get("/users")
			.set("Authorization", token);
		const userTobeUpdateId = userTobeUpdateRequest.body[0].id;

		const response = await request(app)
			.patch(`/users/13970660-5dbe-423a-9a9d-5c23b37943cf`)
			.set("Authorization", token)
			.send(newValues);

		expect(response.body).toHaveProperty("message");
		expect(response.status).toBe(404);
	});

	test("PATCH /users/:id - should not be able to update isAdm field value", async () => {
		const newValues = { isAdm: false };

		const admingLoginResponse = await request(app)
			.post("/login")
			.send(mockedAdminLogin);
		const token = `Bearer ${admingLoginResponse.body.token}`;

		const userTobeUpdateRequest = await request(app)
			.get("/users")
			.set("Authorization", token);
		const userTobeUpdateId = userTobeUpdateRequest.body[0].id;

		const response = await request(app)
			.patch(`/users/${userTobeUpdateId}`)
			.set("Authorization", token)
			.send(newValues);

		expect(response.body).toHaveProperty("message");
		expect(response.status).toBe(401);
	});

	test("PATCH /users/:id - should not be able to update isActive field value", async () => {
		const newValues = { isActive: false };

		const admingLoginResponse = await request(app)
			.post("/login")
			.send(mockedAdminLogin);
		const token = `Bearer ${admingLoginResponse.body.token}`;

		const userTobeUpdateRequest = await request(app)
			.get("/users")
			.set("Authorization", token);
		const userTobeUpdateId = userTobeUpdateRequest.body[0].id;

		const response = await request(app)
			.patch(`/users/${userTobeUpdateId}`)
			.set("Authorization", token)
			.send(newValues);
		expect(response.body).toHaveProperty("message");
		expect(response.status).toBe(401);
	});

	test("PATCH /users/:id - should not be able to update id field value", async () => {
		const newValues = { id: false };

		const admingLoginResponse = await request(app)
			.post("/login")
			.send(mockedAdminLogin);
		const token = `Bearer ${admingLoginResponse.body.token}`;

		const userTobeUpdateRequest = await request(app)
			.get("/users")
			.set("Authorization", token);
		const userTobeUpdateId = userTobeUpdateRequest.body[0].id;

		const response = await request(app)
			.patch(`/users/${userTobeUpdateId}`)
			.set("Authorization", token)
			.send(newValues);
		expect(response.body).toHaveProperty("message");
		expect(response.status).toBe(401);
	});

	test("PATCH /users/:id - should not be able to update another user without adm permission", async () => {
		const newValues = { isActive: false };

		const userLoginResponse = await request(app)
			.post("/login")
			.send(mockedUser);
		const admingLoginResponse = await request(app)
			.post("/login")
			.send(mockedAdminLogin);
		const userToken = `Bearer ${userLoginResponse.body.token}`;
		const adminToken = `Bearer ${admingLoginResponse.body.token}`;

		const userTobeUpdateRequest = await request(app)
			.get("/users")
			.set("Authorization", adminToken);
		const userTobeUpdateId = userTobeUpdateRequest.body[1].id;

		const response = await request(app)
			.patch(`/users/${userTobeUpdateId}`)
			.set("Authorization", userToken)
			.send(newValues);

		expect(response.body).toHaveProperty("message");
		expect(response.status).toBe(401);
	});

	test("PATCH /users/:id -  should be able to update user", async () => {
		const newValues = { name: "Joana Brito", email: "joanabrito@mail.com" };

		const admingLoginResponse = await request(app)
			.post("/login")
			.send(mockedAdminLogin);
		const token = `Bearer ${admingLoginResponse.body.token}`;

		const userTobeUpdateRequest = await request(app)
			.get("/users")
			.set("Authorization", token);
		const userTobeUpdateId = userTobeUpdateRequest.body[0].id;

		const response = await request(app)
			.patch(`/users/${userTobeUpdateId}`)
			.set("Authorization", token)
			.send(newValues);

		const userUpdated = await request(app)
			.get("/users")
			.set("Authorization", token);

		expect(response.status).toBe(200);
		expect(userUpdated.body[0].name).toEqual("Joana Brito");
		expect(userUpdated.body[0]).not.toHaveProperty("password");
	});
});
