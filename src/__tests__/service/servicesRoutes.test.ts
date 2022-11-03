import { DataSource } from "typeorm";
import request from "supertest";
import AppDataSource from "../../data-source";
import app from "../../app";
import { insertServices } from "../insertQuerys";

describe("/services", () => {
  let connection: DataSource;

  beforeAll(async () => {
    await AppDataSource.initialize()
      .then((res) => {
        connection = res;
      })
      .catch((err) => {
        console.error("Error during Data Source initialization", err);
      });

    await insertServices(AppDataSource);
  });

  afterAll(async () => {
    await connection.destroy();
  });

  test("GET /services - Should be able to list all services", async () => {
    const response = await request(app).get("/services");

    expect(response.body[0]).toHaveProperty("id");
    expect(response.body[0]).toHaveProperty("name");
    expect(response.body[0]).toHaveProperty("description");
    expect(response.body[0]).toHaveProperty("price");
    expect(response.body).toHaveLength(6);
    expect(response.status).toBe(200);
  });
});
