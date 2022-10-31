import request from "supertest";
import { DataSource } from "typeorm";
import app from "../../app";
import AppDataSource from "../../data-source";
import { IPet } from "../../interfaces/pets";
import {
  mockedAdmin,
  mockedAdminLogin,
  mockedCat,
  mockedDog,
  mockedEditPet,
  mockedUser,
  mockedUserLogin,
} from "../mocks";

describe("/pets", () => {
  let connection: DataSource;
  let userCreatedPet: IPet;
  let adminCreatedPet: IPet;

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

  test("POST /pets -  should not be able to register a pet if not authenticated", async () => {
    const response = await request(app).post("/pets").send(mockedCat);

    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(401);
  });

  test("POST /pets - should be able to register a new pet", async () => {
    const userLoginResponse = await request(app)
      .post("/login")
      .send(mockedUserLogin);
    console.log(userLoginResponse.body);
    const response = await request(app)
      .post("/pets")
      .set("Authorization", `Bearer ${userLoginResponse.body.token}`)
      .send(mockedCat);
    userCreatedPet = response.body;
    expect(response.body).toHaveProperty("id");
    expect(response.body.name).toEqual(mockedCat.name);
    expect(response.body.type).toEqual(mockedCat.type);
    expect(response.body.age).toEqual(mockedCat.age);
    expect(response.body.neutered).toEqual(mockedCat.neutered);
    expect(response.body.vaccinated).toEqual(mockedCat.vaccinated);
    expect(response.body.docile).toEqual(mockedCat.docile);
    expect(response.status).toBe(201);

    // second example
    const adminLoginResponse = await request(app)
      .post("/login")
      .send(mockedAdminLogin);
    const adminResponse = await request(app)
      .post("/pets")
      .set("Authorization", `Bearer ${adminLoginResponse.body.token}`)
      .send(mockedDog);
    adminCreatedPet = response.body;
    expect(adminResponse.body).toHaveProperty("id");
    expect(adminResponse.body.name).toEqual(mockedDog.name);
    expect(adminResponse.body.type).toEqual(mockedDog.type);
    expect(adminResponse.body.age).toEqual(mockedDog.age);
    expect(adminResponse.body.neutered).toEqual(mockedDog.neutered);
    expect(adminResponse.body.vaccinated).toEqual(mockedDog.vaccinated);
    expect(adminResponse.body.docile).toEqual(mockedDog.docile);
    expect(adminResponse.status).toBe(201);
  });

  test("GET /pets - should be able to list a user's pets", async () => {
    const userLoginResponse = await request(app)
      .post("/login")
      .send(mockedUserLogin);
    const response = await request(app)
      .get("/pets")
      .set("Authorization", `Bearer ${userLoginResponse.body.token}`);

    expect(response.body.length).toEqual(1);
    expect(response.body[0]).toHaveProperty("id");
    expect(response.body[0].name).toBe(mockedCat.name);
    expect(response.body[0].type).toBe(mockedCat.type);
    expect(response.body[0].age).toBe(mockedCat.age);
    expect(response.status).toBe(200);
  });

  test("GET /pets - admin should be able to list all pets", async () => {
    const adminLoginResponse = await request(app)
      .post("/login")
      .send(mockedAdminLogin);
    const response = await request(app)
      .get("/pets")
      .set("Authorization", `Bearer ${adminLoginResponse.body.token}`);

    expect(response.body.length).toEqual(2);
    expect(response.status).toBe(200);
  });

  test("PATCH /pets/:id - should not be able to edit a pet not owned by the user", async () => {
    const userLoginResponse = await request(app)
      .post("/login")
      .send(mockedUserLogin);
    const response = await request(app)
      .patch(`/pets/${adminCreatedPet.id}`)
      .send(mockedEditPet)
      .set("Authorization", `Bearer ${userLoginResponse.body.token}`);

    expect(response.status).toHaveProperty("message");
    expect(response.status).toBe(403);
  });

  test("PATCH /pets/:id - should be able to edit a pet's info", async () => {
    const userLoginResponse = await request(app)
      .post("/login")
      .send(mockedUserLogin);
    const response = await request(app)
      .patch(`/pets/${userCreatedPet.id}`)
      .send(mockedEditPet)
      .set("Authorization", `Bearer ${userLoginResponse.body.token}`);

    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("name");
    expect(response.body).toHaveProperty("type");
    expect(response.body).toHaveProperty("age");
    expect(response.body).toHaveProperty("vaccinated");
    expect(response.body).toHaveProperty("neutered");
    expect(response.body).toHaveProperty("vaccinated");
    expect(response.body).toHaveProperty("docile");
    expect(response.status).toBe(200);
  });

  test("PATCH /pets/:id - admin should be able to edit any pet's info", async () => {
    const adminLoginResponse = await request(app)
      .post("/login")
      .send(mockedAdminLogin);
    const response = await request(app)
      .patch(`/pets/${userCreatedPet.id}`)
      .send(mockedEditPet)
      .set("Authorization", `Bearer ${adminLoginResponse.body.token}`);

    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("name");
    expect(response.body).toHaveProperty("type");
    expect(response.body).toHaveProperty("age");
    expect(response.body).toHaveProperty("vaccinated");
    expect(response.body).toHaveProperty("neutered");
    expect(response.body).toHaveProperty("vaccinated");
    expect(response.body).toHaveProperty("docile");
    expect(response.status).toBe(200);
  });

  test("DELETE /pets/:id - should not be able to delete a pet not owned by the user", async () => {
    const userLoginResponse = await request(app)
      .post("/login")
      .send(mockedUserLogin);
    const response = await request(app)
      .delete(`/pets/${adminCreatedPet.id}`)
      .send(mockedEditPet)
      .set("Authorization", `Bearer ${userLoginResponse.body.token}`);

    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(403);
  });

  test("DELETE /pets/:id - should be able to delete a pet", async () => {
    const userLoginResponse = await request(app)
      .post("/login")
      .send(mockedUserLogin);
    const response = await request(app)
      .delete(`/pets/${userCreatedPet.id}`)
      .set("Authorization", `Bearer ${userLoginResponse.body.token}`);

    expect(response.status).toBe(204);
  });
});
