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
import { insertRooms, insertRoomTypes } from "../insertQuerys";

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

  test("GET /rooms/dates/:roomTypeId - should be able to list all dates in which a room type is unavailable", async () => {
    // requires POST /reservation route
  });
});
