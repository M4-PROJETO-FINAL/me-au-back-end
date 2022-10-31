import { mockedAdminLogin, mockedReservation, mockedReservationCat, mockedReservationDog, mockedUserLogin } from "../mocks/index";
//
import { DataSource } from "typeorm";
import request from "supertest";
import { mockedAdmin, mockedUser } from "../mocks";
import AppDataSource from "../../data-source";
import app from "../../app";
import { IReservationRequest } from "../../interfaces/reservations";

describe("/users", () => {
	let connection: DataSource;
    let reservation: IReservationRequest;

	beforeAll(async () => {
		await AppDataSource.initialize()
			.then((res) => {
				connection = res;
			})
			.catch((err) => {
				console.error("Error during Data Source initialization", err);
			});

            await request(app).post("/users").send(mockedUser);
            await request(app).post("/users").send(mockedAdmin);
	});

	afterAll(async () => {
		await connection.destroy();
	});

    test("POST /reservations -  Must be able to create a reservation", async () => {
        const loginResponse = await request(app).post("/login").send(mockedUserLogin);
		const response = await request(app).post("/reservation").set("Authorization", `Bearer ${loginResponse.body.token}`).send(mockedReservation);

        reservation = response.body
       
		expect(response.body).toHaveProperty("checkin");
		expect(response.body.checkin).toEqual(reservation.checkin);
		expect(response.body).toHaveProperty("checkout");
		expect(response.body.checkout).toEqual(reservation.checkout);
		expect(response.body).toHaveProperty("services");
		expect(response.body).toHaveProperty("pet_rooms");
		
		expect(response.status).toBe(201);
	})

    test("POST /reservation -  Should not be able to create a reservation on the date of a room that has already been booked",async () => {
        const loginResponse = await request(app).post("/login").send(mockedUserLogin);
		const response = await request(app).post("/reservation").set("Authorization", `Bearer ${loginResponse.body.token}`).send(mockedReservation);

        expect(response.body).toHaveProperty("message")
        expect(response.status).toBe(400)
    })

    test("POST /reservation -  Should not be able to book a cat room for a dog",async () => {
        const userLoginResponse = await request(app).post("/login").send(mockedUserLogin);
        const response = await request(app).post('/reservation').set("Authorization", `Bearer ${userLoginResponse.body.token}`).send(mockedReservationDog)

        expect(response.body).toHaveProperty("message")
        expect(response.status).toBe(400)
    })

    test("POST /reservation -  Should not be able to book a dog room for a cat",async () => {
        const userLoginResponse = await request(app).post("/login").send(mockedUserLogin);
        const response = await request(app).post('/reservation').set("Authorization", `Bearer ${userLoginResponse.body.token}`).send(mockedReservationCat)

        expect(response.body).toHaveProperty("message")
        expect(response.status).toBe(400)
    })


//     test("POST /reservation -  Should not be able to book a reservation to a date that already has been passed",async () => {
//         const adminLoginResponse = await request(app).post("/login").send(mockedAdminLogin);
//         const users = await request(app).get('/users').set("Authorization", `Bearer ${adminLoginResponse.body.token}`)
//         const properties = await request(app).get('/properties')
//         mockedSchedule.propertyId = properties.body[0].id
//         mockedSchedule.userId = users.body[1].id
//         const response = await request(app).post('/schedules').send(mockedSchedule)

//         expect(response.body).toHaveProperty("message")
//         expect(response.status).toBe(401)
//     })
// 
})