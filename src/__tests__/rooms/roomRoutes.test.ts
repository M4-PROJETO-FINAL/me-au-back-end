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
import { v4 as uuidv4 } from "uuid";

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
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.manager.query(
      `INSERT INTO "room_types" ("id", "title", "description", "image", "capacity", "price") VALUES ('${uuidv4()}', 'Quarto Compartilhado', 'Ótimo custo benefício, essa opção é ideal para você que deseja que o seu pet interaja com outros catioros!', 'https://storage.googleapis.com/cmsapi.sistema.cim.br/C-307MMTG2XWCYRO/2021-05/ZFS0iTHLKOmnOZCa3eB2FlX0/html_content.jpeg?v=20220627161024', 20, 120), ('${uuidv4()}', 'Quarto Privativo (cães)', 'Busca conforto e privacidade para o seu cãozinho? O quarto privativo é a opção ideal!', 'https://static.wixstatic.com/media/3c9e04_9e67eefb471c48b483a4aba70236fb3e~mv2_d_5175_3450_s_4_2.jpg/v1/fill/w_587,h_444,q_85,usm_0.66_1.00_0.01/3c9e04_9e67eefb471c48b483a4aba70236fb3e~mv2_d_5175_3450_s_4_2.jpg', 2, 250), ('${uuidv4()}', 'Quarto Privativo (gatos)', 'Quarto privativo de alto padrão para o seu felino aproveitar com classe!', 'https://static.wixstatic.com/media/3c9e04_e6167e6e41a8456584250793ba200198~mv2_d_5093_3395_s_4_2.jpg/v1/fill/w_587,h_444,q_85,usm_0.66_1.00_0.01/3c9e04_e6167e6e41a8456584250793ba200198~mv2_d_5093_3395_s_4_2.jpg', 2, 250 )`
    );

    await queryRunner.query(
      `INSERT INTO "rooms" ("id", "roomTypeId") SELECT '${uuidv4()}', "id" FROM "room_types" WHERE "title" = 'Quarto Compartilhado'`
    );

    for (let i = 0; i < 4; i++) {
      await queryRunner.query(
        `INSERT INTO "rooms" ("id", "roomTypeId") SELECT '${uuidv4()}', "id" FROM "room_types" WHERE "title" = 'Quarto Privativo (cães)'`
      );
    }

    for (let i = 0; i < 4; i++) {
      await queryRunner.query(
        `INSERT INTO "rooms" ("id", "roomTypeId") SELECT '${uuidv4()}', "id" FROM "room_types" WHERE "title" = 'Quarto Privativo (gatos)'`
      );
    }

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
