import {
  mockedAdminLogin,
  mockedCat,
  mockedDog,
  mockedReservation,
  mockedReservationCat,
  mockedReservationDatePassed,
  mockedReservationDog,
  mockedReservationInvalidDate,
  mockedUserLogin,
} from "../mocks/index";
import { DataSource } from "typeorm";
import request from "supertest";
import { mockedAdmin, mockedUser } from "../mocks";
import AppDataSource from "../../data-source";
import app from "../../app";
import { IReservationRequest } from "../../interfaces/reservations";
import { IRoomType } from "../../interfaces/rooms";
import { RoomType } from "../../entities/roomType.entity";
import { Service } from "../../entities/service.entity";
import { Pet } from "../../entities/pet.entity";
import { insertRooms, insertRoomTypes, insertServices } from "../insertQuerys";

describe("/users", () => {
  let connection: DataSource;
  let reservation: IReservationRequest;
  let typeRoom: RoomType[];
  let services: Service[];
  let createdCat: Pet;
  let createdDog: Pet;

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
    createdCat = (
      await request(app)
        .post("/pets")
        .send(mockedCat)
        .set("Authorization", `Bearer ${loginResponse.body.token}`)
    ).body;
    createdDog = (
      await request(app)
        .post("/pets")
        .send(mockedDog)
        .set("Authorization", `Bearer ${loginResponse.body.token}`)
    ).body;
    typeRoom = (await request(app).get("/rooms/types")).body;
    services = (await request(app).get("/services")).body;
  });

  afterAll(async () => {
    await connection.destroy();
  });

  test("POST /reservations -  Must be able to create a reservation", async () => {
    const loginResponse = await request(app)
      .post("/login")
      .send(mockedUserLogin);

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
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .send(mockRes);

    reservation = response.body;

    console.log(response.body);

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

  test("POST /reservations -  Should not be able to create a reservation on the date of a room that has already been booked", async () => {
    const loginResponse = await request(app)
      .post("/login")
      .send(mockedUserLogin);

    // garantir que a requisição abaixo retorne pelo menos uma data:
    const dates = await request(app).get(`/room/dates/${typeRoom[0].id}`);

    mockedReservationInvalidDate.checkin = dates.body[0];
    mockedReservationInvalidDate.services![0].service_id = services[0].id;
    mockedReservationInvalidDate.services![0].amount = 1;

    const response = await request(app)
      .post("/reservations")
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .send(mockedReservationInvalidDate);

    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(400);
  });

  test("POST /reservations -  Should not be able to book a cat room for a dog", async () => {
    const loginResponse = await request(app)
      .post("/login")
      .send(mockedUserLogin);

    mockedReservationCat.pet_rooms[0].room_type_id = typeRoom[1].id;
    mockedReservationCat.pet_rooms[0].pet_id = createdCat.id;

    const response = await request(app)
      .post("/reservations")
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .send(mockedReservationCat);

    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(400);
  });

  test("POST /reservations -  Should not be able to book a dog room for a cat", async () => {
    const loginResponse = await request(app)
      .post("/login")
      .send(mockedUserLogin);
    const petId = await request(app)
      .get("/pets")
      .set("Authorization", `Bearer ${loginResponse.body.token}`);

    mockedReservationDog.pet_rooms[0].room_type_id = typeRoom[2].id;
    mockedReservationDog.pet_rooms[0].pet_id = petId.body.id;

    const response = await request(app)
      .post("/reservations")
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .send(mockedReservationDog);

    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(400);
  });

  test("POST /reservations -  Should not be able to book a reservation to a date that already has been passed", async () => {
    const loginResponse = await request(app)
      .post("/login")
      .send(mockedUserLogin);

    const response = await request(app)
      .post("/reservations")
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .send(mockedReservationDatePassed);

    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(400);
  });

  test("GET /reservations - Must be able to list all reservations of the application if is admin", async () => {
    const adminLoginResponse = await request(app)
      .post("/login")
      .send(mockedAdminLogin);
    const response = await request(app)
      .get("/reservations")
      .set("Authorization", `Bearer ${adminLoginResponse.body.token}`);

    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("checkin");
    expect(response.body).toHaveProperty("checkout");
    expect(response.body).toHaveProperty("schedules");
    expect(response.body.pet_rooms[0]).toHaveProperty("pet_id");
    expect(response.body.pet_rooms[0]).toHaveProperty("room_type_id");
    expect(response.body.services[0]).toHaveProperty("service_id");
    expect(response.body.services[0]).toHaveProperty("amount");
    expect(response.body).toHaveLength(1);
    expect(response.status).toBe(200);
  });

  test("GET /reservations - Must be able to list all reservations of the user", async () => {
    const loginResponse = await request(app)
      .post("/login")
      .send(mockedUserLogin);
    const response = await request(app)
      .get("/reservations")
      .set("Authorization", `Bearer ${loginResponse.body.token}`);

    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("checkin");
    expect(response.body).toHaveProperty("checkout");
    expect(response.body).toHaveProperty("schedules");
    expect(response.body.pet_rooms[0]).toHaveProperty("pet_id");
    expect(response.body.pet_rooms[0]).toHaveProperty("room_type_id");
    expect(response.body.services[0]).toHaveProperty("service_id");
    expect(response.body.services[0]).toHaveProperty("amount");
    expect(response.body).toHaveLength(1);
    expect(response.status).toBe(200);
  });

  test("GET /reservations - Should not be able to list reservations without authentication", async () => {
    const response = await request(app).get("/reservations");

    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(401);
  });
  //NAO TERMINADA
  test("DELETE /reservations/:id - Must be able to cancel the reservation", async () => {
    await request(app).post("/users").send(mockedUser);

    const userLoginResponse = await request(app)
      .post("/login")
      .send(mockedUserLogin);
    const reservationTobeDeleted = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${userLoginResponse.body.token}`);

    const response = await request(app)
      .delete(`/reservations/${reservationTobeDeleted.body[0].id}`)
      .set("Authorization", `Bearer ${userLoginResponse.body.token}`);
    expect(response.status).toBe(204);
  });

  test("DELETE /reservations/:id - Must be able to cancel the reservation of another user with adm permission", async () => {
    const adminLoginResponse = await request(app)
      .post("/login")
      .send(mockedAdminLogin);
    const ReservationTobeDeleted = await request(app)
      .get("/reservations")
      .set("Authorization", `Bearer ${adminLoginResponse.body.token}`);

    const response = await request(app)
      .delete(`/reservations/${ReservationTobeDeleted.body[0].id}`)
      .set("Authorization", `Bearer ${adminLoginResponse.body.token}`);

    expect(response.status).toBe(403);
  });

  test("DELETE - Should not be able to cancel the reservation of another user without adm permission", async () => {
    const userLoginResponse = await request(app)
      .post("/login")
      .send(mockedUserLogin);

    const adminLoginResponse = await request(app)
      .post("/login")
      .send(mockedAdminLogin);

    const ReservationTobeDeleted = await request(app)
      .get("/reservations")
      .set("Authorization", `Bearer ${adminLoginResponse.body.token}`);

    const response = await request(app)
      .delete(`/reservations/${ReservationTobeDeleted.body[0].id}`)
      .set("Authorization", `Bearer ${userLoginResponse.body.token}`);

    expect(response.status).toBe(403);
  });

  test("DELETE - Should not be able to cancel the reservation with invalid id (param id)", async () => {
    await request(app).post("/users").send(mockedAdmin);

    const adminLoginResponse = await request(app)
      .post("/login")
      .send(mockedAdminLogin);

    const response = await request(app)
      .delete(`/reservations/00000001-0fff-000f-0f1f-0f10f00111ff`)
      .set("Authorization", `Bearer ${adminLoginResponse.body.token}`);

    expect(response.status).toBe(404);
  });

  test("DELETE - Should not be able to cancel the reservation without authentication", async () => {
    const adminLoginResponse = await request(app)
      .post("/login")
      .send(mockedAdminLogin);

    const reservationTobeDeleted = await request(app)
      .get("/reservations")
      .set("Authorization", `Bearer ${adminLoginResponse.body.token}`);

    const response = await request(app).delete(
      `/reservations/${reservationTobeDeleted.body[0].id}`
    );

    expect(response.status).toBe(401);
  });
});
