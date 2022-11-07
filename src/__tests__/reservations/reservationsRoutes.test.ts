import {
	mockedAdminLogin,
	mockedCat,
	mockedDog,
	mockedReservation,
	mockedReservationDatePassed,
	mockedUserLogin,
} from "../mocks/index";
import { DataSource } from "typeorm";
import request from "supertest";
import { mockedAdmin, mockedUser } from "../mocks";
import AppDataSource from "../../data-source";
import app from "../../app";
import { IReservationResponse } from "../../interfaces/reservations";
import { IRoomType } from "../../interfaces/rooms";
import { RoomType } from "../../entities/roomType.entity";
import { Service } from "../../entities/service.entity";
import { Pet } from "../../entities/pet.entity";
import {
	insertRooms,
	insertRoomTypes,
	insertServices,
	occupy4CatRooms,
} from "../insertQuerys";

describe("/users", () => {
	let connection: DataSource;
	let typeRoom: RoomType[];
	let services: Service[];
	let createdCat: Pet;
	let createdDog: Pet;
	let userToken: string;
	let adminToken: string;
	let reservation: IReservationResponse;

	beforeAll(async () => {
		await AppDataSource.initialize()
			.then((res) => {
				connection = res;
			})
			.catch((err) => {
				console.error("Error during Data Source initialization", err);
			});
		await insertRoomTypes(AppDataSource);
		await insertRooms(AppDataSource);
		await insertServices(AppDataSource);

		await request(app).post("/users").send(mockedUser);
		await request(app).post("/users").send(mockedAdmin);

		const loginResponse = await request(app)
			.post("/login")
			.send(mockedUserLogin);
		userToken = loginResponse.body.token;
		createdCat = (
			await request(app)
				.post("/pets")
				.send(mockedCat)
				.set("Authorization", `Bearer ${userToken}`)
		).body;
		createdDog = (
			await request(app)
				.post("/pets")
				.send(mockedDog)
				.set("Authorization", `Bearer ${userToken}`)
		).body;
		typeRoom = (await request(app).get("/rooms/types")).body;
		services = (await request(app).get("/services")).body;

		const adminLoginResponse = await request(app)
			.post("/login")
			.send(mockedAdminLogin);
		adminToken = adminLoginResponse.body.token;
	});

	afterAll(async () => {
		await connection.destroy();
	});

	test("POST /reservations - should be able to create a reservation", async () => {
		const mockRes = { ...mockedReservation };
		mockRes.pet_rooms = [
			{
				pet_id: createdDog.id,
				room_type_id: typeRoom[0].id,
			},
		];
		mockRes.services = [
			{
				service_id: services[3].id,
				amount: 2,
			},
		];

		const response = await request(app)
			.post("/reservations")
			.set("Authorization", `Bearer ${userToken}`)
			.send(mockRes);

		reservation = response.body;

		expect(response.body).toHaveProperty("id");
		expect(response.body.status).toBe("reserved");
		expect(response.body).toHaveProperty("checkin");
		expect(response.body.checkin.slice(0, 10)).toEqual(mockRes.checkin);
		expect(response.body).toHaveProperty("checkout");
		expect(response.body.checkout.slice(0, 10)).toEqual(mockRes.checkout);
		expect(response.body).toHaveProperty("services");
		expect(response.body).toHaveProperty("pet_rooms");

		expect(response.status).toBe(201);
	});

	test("POST /reservations - should not be able to create a reservation for a pet who is already booked for conflicting dates", async () => {
		const mockRes = { ...mockedReservation };
		mockRes.pet_rooms = [
			{
				pet_id: createdDog.id,
				room_type_id: typeRoom[0].id,
			},
		];
		mockRes.services = [
			{
				service_id: services[3].id,
				amount: 2,
			},
		];

		const response = await request(app)
			.post("/reservations")
			.set("Authorization", `Bearer ${userToken}`)
			.send(mockRes);

		expect(response.body).toHaveProperty("message");
		expect(
			response.body.message.includes("is already booked for a conflicting date")
		).toBe(true);
		expect(response.status).toBe(400);

		await request(app)
			.delete(`/reservations/${reservation.id}`)
			.set("Authorization", `Bearer ${userToken}`);
	});

	test("POST /reservations - should be able to create a reservation for the current day", async () => {
		const mockRes = { ...mockedReservation };
		mockRes.pet_rooms = [
			{
				pet_id: createdDog.id,
				room_type_id: typeRoom[0].id,
			},
		];
		mockRes.services = [
			{
				service_id: services[3].id,
				amount: 2,
			},
		];
		const checkinDate = new Date();
		let checkinDay = checkinDate.getDate().toString();
		let checkinMonth = (checkinDate.getMonth() + 1).toString();
		const checkinYear = checkinDate.getFullYear();

		if (+checkinDay < 10) {
			checkinDay = "0" + checkinDay;
		}
		if (+checkinMonth < 10) {
			checkinMonth = "0" + checkinMonth;
		}

		const checkin = `${checkinYear}-${checkinMonth}-${checkinDay}`;
		mockRes.checkin = checkin;

		const response = await request(app)
			.post("/reservations")
			.set("Authorization", `Bearer ${userToken}`)
			.send(mockRes);

		expect(response.body).toHaveProperty("id");
		expect(response.body.status).toBe("reserved");
		expect(response.body).toHaveProperty("checkin");
		expect(response.body.checkin.slice(0, 10)).toEqual(mockRes.checkin);
		expect(response.body).toHaveProperty("checkout");
		expect(response.body.checkout.slice(0, 10)).toEqual(mockRes.checkout);
		expect(response.body).toHaveProperty("services");
		expect(response.body).toHaveProperty("pet_rooms");

		expect(response.status).toBe(201);
	});

	test("POST /reservations - should not be able to create a reservation for a date in which the required room type is unavailable", async () => {
		await occupy4CatRooms();
		const roomTypeRepository = AppDataSource.getRepository(RoomType);
		const catRoom = await roomTypeRepository.findOneBy({
			title: "Quarto Privativo (gatos)",
		});
		const dates = await request(app).get(`/rooms/dates/${catRoom!.id}`);

		const mockRes = { ...mockedReservation };
		mockRes.checkin = dates.body[0].slice(0, 10);
		mockRes.pet_rooms = [
			{
				pet_id: createdCat.id,
				room_type_id: typeRoom[2].id,
			},
		];
		mockRes.services = [];

		const response = await request(app)
			.post("/reservations")
			.set("Authorization", `Bearer ${userToken}`)
			.send(mockRes);

		expect(response.body).toHaveProperty("message");
		expect(response.body.message.includes("No available rooms")).toBe(true);
		expect(response.status).toBe(400);
	});

	test("POST /reservations - should not be able to create a reservation  on a invalid checkin date format", async () => {
		const mockRes = { ...mockedReservation };
		mockRes.pet_rooms = [
			{
				pet_id: createdDog.id,
				room_type_id: typeRoom[0].id,
			},
		];
		mockRes.services = [
			{
				service_id: services[3].id,
				amount: 2,
			},
		];

		mockRes.checkin = "22-10-2025";

		const response = await request(app)
			.post("/reservations")
			.set("Authorization", `Bearer ${userToken}`)
			.send(mockRes);

		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty("message");
		expect(response.body.message).toBe(
			"Invalid date format. Should be YYYY-MM-DD."
		);
	});

	test("POST /reservations - should not be able to create a reservation on a date that does not exist", async () => {
		const mockRes = { ...mockedReservation };
		mockRes.pet_rooms = [
			{
				pet_id: createdDog.id,
				room_type_id: typeRoom[0].id,
			},
		];
		mockRes.services = [
			{
				service_id: services[3].id,
				amount: 2,
			},
		];

		mockRes.checkin = "2025-30-15";

		const response = await request(app)
			.post("/reservations")
			.set("Authorization", `Bearer ${userToken}`)
			.send(mockRes);

		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty("message");
		expect(response.body.message).toBe(
			"Invalid date. This date does not exist."
		);
	});

	test("POST /reservations - should not be able to create a reservation if the checkin date is after the checkout date", async () => {
		const mockRes = { ...mockedReservation };
		mockRes.pet_rooms = [
			{
				pet_id: createdDog.id,
				room_type_id: typeRoom[0].id,
			},
		];
		mockRes.services = [
			{
				service_id: services[3].id,
				amount: 2,
			},
		];

		mockRes.checkin = "2025-10-15";
		mockRes.checkout = "2025-10-10";

		const response = await request(app)
			.post("/reservations")
			.set("Authorization", `Bearer ${userToken}`)
			.send(mockRes);

		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty("message");
		expect(response.body.message).toBe(
			"Invalid checkin date. Checkout date should be after checkin date."
		);
	});

	test("POST /reservations - should not be able to create a reservation if the checkin date is equal to the checkout date", async () => {
		const mockRes = { ...mockedReservation };
		mockRes.pet_rooms = [
			{
				pet_id: createdDog.id,
				room_type_id: typeRoom[0].id,
			},
		];
		mockRes.services = [
			{
				service_id: services[3].id,
				amount: 2,
			},
		];

		mockRes.checkin = "2025-10-10";
		mockRes.checkout = "2025-10-10";

		const response = await request(app)
			.post("/reservations")
			.set("Authorization", `Bearer ${userToken}`)
			.send(mockRes);

		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty("message");
		expect(response.body.message).toBe(
			"Invalid checkin date. Checkout date should be after checkin date."
		);
	});

	test("POST /reservations - should not be able to create a reservation with an invalid service_id", async () => {
		const mockRes = { ...mockedReservation };
		mockRes.pet_rooms = [
			{
				pet_id: createdDog.id,
				room_type_id: typeRoom[0].id,
			},
		];
		mockRes.services = [
			{
				service_id: "4aebdc17-0bab-4afa-814a-90927ee08c7c",
				amount: 2,
			},
		];

		mockRes.checkin = "2025-10-10";
		mockRes.checkout = "2025-10-11";

		const response = await request(app)
			.post("/reservations")
			.set("Authorization", `Bearer ${userToken}`)
			.send(mockRes);

		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty("message");
		expect(response.body.message).toBe("Invalid service_id.");
	});

	test("POST /reservations - should not be able to create a reservation with an invalid room_type_id", async () => {
		const mockRes = { ...mockedReservation };
		mockRes.pet_rooms = [
			{
				pet_id: createdDog.id,
				room_type_id: "4aebdc17-0bab-4afa-814a-90927ee08c7c",
			},
		];
		mockRes.services = [
			{
				service_id: services[3].id,
				amount: 2,
			},
		];

		mockRes.checkin = "2025-10-10";
		mockRes.checkout = "2025-10-12";

		const response = await request(app)
			.post("/reservations")
			.set("Authorization", `Bearer ${userToken}`)
			.send(mockRes);

		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty("message");
		expect(response.body.message).toBe("Invalid room_type_id.");
	});

	test("POST /reservations - should not be able to create a reservation with an invalid pet_id", async () => {
		const mockRes = { ...mockedReservation };
		mockRes.pet_rooms = [
			{
				pet_id: "4aebdc17-0bab-4afa-814a-90927ee08c7c",
				room_type_id: typeRoom[0].id,
			},
		];
		mockRes.services = [
			{
				service_id: services[3].id,
				amount: 2,
			},
		];

		mockRes.checkin = "2025-10-10";
		mockRes.checkout = "2025-10-20";

		const response = await request(app)
			.post("/reservations")
			.set("Authorization", `Bearer ${userToken}`)
			.send(mockRes);

		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty("message");
		expect(response.body.message).toBe("Invalid pet_id.");
	});

	test("POST /reservations - should not be able to book a cat room for a dog", async () => {
		const mockRes = { ...mockedReservation };
		mockRes.pet_rooms = [
			{
				pet_id: createdDog.id,
				room_type_id: typeRoom[2].id,
			},
		];
		mockRes.services = [];

		const response = await request(app)
			.post("/reservations")
			.set("Authorization", `Bearer ${userToken}`)
			.send(mockRes);

		expect(response.body).toHaveProperty("message");
		expect(response.status).toBe(400);
	});

	test("POST /reservations - should not be able to book a dog room for a cat", async () => {
		const mockRes = { ...mockedReservation };
		mockRes.pet_rooms = [
			{
				pet_id: createdCat.id,
				room_type_id: typeRoom[1].id,
			},
		];
		mockRes.services = [];

		const response = await request(app)
			.post("/reservations")
			.set("Authorization", `Bearer ${userToken}`)
			.send(mockRes);

		expect(response.body).toHaveProperty("message");
		expect(response.status).toBe(400);
	});

	test("POST /reservations - should not be able to book a reservation to a date that has already passed", async () => {
		const response = await request(app)
			.post("/reservations")
			.set("Authorization", `Bearer ${userToken}`)
			.send(mockedReservationDatePassed);

		expect(response.body).toHaveProperty("message");
		expect(response.status).toBe(400);
		expect(response.body.message).toBe(
			"Invalid checkin date. Checkin should not be in a date that has already passed."
		);
	});

	test("POST /reservations - should not be able to book a reservation to a duplicated pet in the request body", async () => {
		const mockRes = { ...mockedReservation };
		mockRes.pet_rooms = [
			{
				pet_id: createdCat.id,
				room_type_id: typeRoom[2].id,
			},
			{
				pet_id: createdCat.id,
				room_type_id: typeRoom[2].id,
			},
		];
		mockRes.services = [
			{
				service_id: services[3].id,
				amount: 2,
			},
		];
		const response = await request(app)
			.post("/reservations")
			.set("Authorization", `Bearer ${userToken}`)
			.send(mockRes);

		expect(response.body).toHaveProperty("message");
		expect(response.status).toBe(400);
		expect(response.body.message).toBe(
			"There are duplicated pet in the request."
		);
	});

	test("GET /reservations - should be able to list all reservations of the application if is admin", async () => {
		const response = await request(app)
			.get("/reservations")
			.set("Authorization", `Bearer ${adminToken}`);

		expect(response.body[0]).toHaveProperty("id");
		expect(response.body[0]).toHaveProperty("checkin");
		expect(response.body[0]).toHaveProperty("checkout");
		expect(response.body[0]).toHaveProperty("status");
		expect(response.body[0]).toHaveProperty("created_at");
		expect(response.body[0]).toHaveProperty("updated_at");
		expect(response.status).toBe(200);
	});

	test("GET /reservations - should be able to list all reservations of the user", async () => {
		const response = await request(app)
			.get("/reservations")
			.set("Authorization", `Bearer ${adminToken}`);

		expect(response.body[0]).toHaveProperty("id");
		expect(response.body[0]).toHaveProperty("checkin");
		expect(response.body[0]).toHaveProperty("checkout");
		expect(response.body[0]).toHaveProperty("status");
		expect(response.body[0]).toHaveProperty("created_at");
		expect(response.body[0]).toHaveProperty("updated_at");
		expect(response.status).toBe(200);
	});

	test("GET /reservations - should not be able to list reservations without authentication", async () => {
		const response = await request(app).get("/reservations");

		expect(response.body).toHaveProperty("message");
		expect(response.status).toBe(401);
	});

	test("DELETE /reservations/:id - should be able to cancel the reservation", async () => {
		const reservations = await request(app)
			.get("/reservations")
			.set("Authorization", `Bearer ${userToken}`);

		const response = await request(app)
			.delete(`/reservations/${reservations.body[1].id}`)
			.set("Authorization", `Bearer ${userToken}`);

		const updatedReservations = await request(app)
			.get("/reservations")
			.set("Authorization", `Bearer ${userToken}`);

		expect(response.status).toBe(204);
		expect(updatedReservations.body[1].status).toBe("cancelled");
	});

	test("DELETE /reservations/:id - should not be able to cancel the reservation of another user without admin permission", async () => {
		const newAdminPet = await request(app)
			.post("/pets")
			.send(mockedDog)
			.set("Authorization", `Bearer ${adminToken}`);

		const mockRes = { ...mockedReservation };
		mockRes.pet_rooms = [
			{
				pet_id: newAdminPet.body.id,
				room_type_id: typeRoom[0].id,
			},
		];
		mockRes.services = [];

		const newAdminReservation = await request(app)
			.post("/reservations")
			.send(mockRes)
			.set("Authorization", `Bearer ${adminToken}`);

		const response = await request(app)
			.delete(`/reservations/${newAdminReservation.body.id}`)
			.set("Authorization", `Bearer ${userToken}`);

		expect(response.status).toBe(403);
	});

	test("DELETE /reservations/:id - should not be able to cancel the reservation with invalid id (param id)", async () => {
		const response = await request(app)
			.delete(`/reservations/00000001-0fff-000f-0f1f-0f10f00111ff`)
			.set("Authorization", `Bearer ${adminToken}`);

		expect(response.status).toBe(404);
	});

	test("DELETE /reservations/:id - should not be able to cancel the reservation without authentication", async () => {
		const reservationTobeDeleted = await request(app)
			.get("/reservations")
			.set("Authorization", `Bearer ${adminToken}`);

		const response = await request(app).delete(
			`/reservations/${reservationTobeDeleted.body[0].id}`
		);

		expect(response.status).toBe(401);
	});

	test("DELETE /reservations/:id - should not be able to delete reservation with status = cancelled", async () => {
		const ReservationTobeDeleted = await request(app)
			.get("/reservations")
			.set("Authorization", `Bearer ${adminToken}`);

		const response = await request(app)
			.delete(`/reservations/${ReservationTobeDeleted.body[0].id}`)
			.set("Authorization", `Bearer ${adminToken}`);

		expect(response.status).toBe(400);
	});
});
