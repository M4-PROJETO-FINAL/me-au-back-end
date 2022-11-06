import request from "supertest";
import { DataSource } from "typeorm";
import app from "../../app";
import AppDataSource from "../../data-source";
import {
  mockedAdmin,
  mockedAdminLogin,
  mockedUser,
  mockedUserLogin,
} from "../mocks";
import {
  insertRooms,
  insertRoomTypes,
  occupy2CatRoomsWith4Cats,
  occupy4CatRooms,
  put20DogsInTheSharedRoom,
} from "../insertQuerys";
import { IReservationResponse } from "../../interfaces/reservations";
import { RoomType } from "../../entities/roomType.entity";

describe("/rooms", () => {
  let connection: DataSource;

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

    await request(app).post("/users").send(mockedUser);
    await request(app).post("/users").send(mockedAdmin);
  });

  afterAll(async () => {
    await connection.destroy();
  });

  test("GET /rooms/types - should be able to list all room types", async () => {
    const response = await request(app).get("/rooms/types");

    expect(response.body.length).toBe(3);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: "Quarto Compartilhado" }),
        expect.objectContaining({ title: "Quarto Privativo (cães)" }),
        expect.objectContaining({ title: "Quarto Privativo (gatos)" }),
      ])
    );
    expect(response.status).toBe(200);
  });

  test("GET /rooms - should not be able to list rooms without authentication", async () => {
    const response = await request(app).get("/rooms");

    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(401);
  });

  test("GET /rooms - should not be able to list rooms without being admin", async () => {
    const userLoginResponse = await request(app)
      .post("/login")
      .send(mockedUserLogin);
    const response = await request(app)
      .get("/rooms")
      .set("Authorization", `Bearer ${userLoginResponse.body.token}`);

    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(403);
  });

  test("GET /rooms - admin should be able to list all rooms", async () => {
    const adminLoginResponse = await request(app)
      .post("/login")
      .send(mockedAdminLogin);
    const response = await request(app)
      .get("/rooms")
      .set("Authorization", `Bearer ${adminLoginResponse.body.token}`);

    expect(response.body.length).toBe(9);
    expect(response.status).toBe(200);
  });

  test("GET /rooms/dates/:roomTypeId - should be able to list all dates in which the shared room is unavailable", async () => {
    await put20DogsInTheSharedRoom();
    const roomTypeRepository = AppDataSource.getRepository(RoomType);
    const sharedRoom = await roomTypeRepository.findOneBy({
      title: "Quarto Compartilhado",
    });

    const response = await request(app).get(`/rooms/dates/${sharedRoom!.id}`);

    expect(response.body.length).toEqual(2);
    expect(response.body[0].toString().includes("2023-01-20")).toBe(true);
    expect(response.body[1].toString().includes("2023-01-21")).toBe(true);
    expect(response.status).toBe(200);
  });

  test("GET /rooms/dates/:roomTypeId - should be able to list all dates in which a private room type is unavailable", async () => {
    await occupy4CatRooms();
    const roomTypeRepository = AppDataSource.getRepository(RoomType);
    const catRoom = await roomTypeRepository.findOneBy({
      title: "Quarto Privativo (gatos)",
    });

    const response = await request(app).get(`/rooms/dates/${catRoom!.id}`);

    expect(response.body.length).toEqual(3);
    expect(response.body[0].toString().includes("2023-01-13")).toBe(true);
    expect(response.body[1].toString().includes("2023-01-14")).toBe(true);
    expect(response.body[2].toString().includes("2023-01-15")).toBe(true);
    expect(response.status).toBe(200);
    const loginResponse = await request(app)
      .post("/login")
      .send(mockedUserLogin);

    // cancel all 4 cat room reservations:
    const reservationsResponse = await request(app)
      .get("/reservations")
      .set("Authorization", `Bearer ${loginResponse.body.token}`);
    const reservations: IReservationResponse[] = reservationsResponse.body;
    const reservationsIds = reservations.map((res) => res.id);
    for (let resId of reservationsIds) {
      await request(app)
        .delete(`/reservations/${resId}`)
        .set("Authorization", `Bearer ${loginResponse.body.token}`);
    }
  });

  test("GET /rooms/dates/:roomTypeId - two pets in the same reservation requested in the same room type should be put in the same room together", async () => {
    await occupy2CatRoomsWith4Cats();
    const roomTypeRepository = AppDataSource.getRepository(RoomType);
    const catRoom = await roomTypeRepository.findOneBy({
      title: "Quarto Privativo (gatos)",
    });

    const response = await request(app).get(`/rooms/dates/${catRoom!.id}`);

    expect(response.body.length).toEqual(0);
  });
});
