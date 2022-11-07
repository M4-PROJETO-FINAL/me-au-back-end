import request from "supertest";
import { DataSource } from "typeorm";
import app from "../../app";
import AppDataSource from "../../data-source";
import { IReviewRequest } from "../../interfaces/reviews";
import {
  mockedAdmin,
  mockedAdminLogin,
  mockedReview,
  mockedEditReview,
  mockedReviewInvalidStarZero,
  mockedReviewInvalidStarsSix,
  mockedReviewInvalidStarsWithout,
  mockedReviewInvalidTextWithout,
  mockedUser,
  mockedUserLogin,
  mockedDog,
  mockedReservation,
} from "../mocks";
import { insertRooms, insertRoomTypes, insertServices } from "../insertQuerys";
import { Pet } from "../../entities/pet.entity";
import { RoomType } from "../../entities/roomType.entity";
import { Service } from "../../entities/service.entity";
import { IReservationRequest } from "../../interfaces/reservations";

describe("/reviews", () => {
  let connection: DataSource;
  let userCreatedReviews: IReviewRequest;
  let reservation: IReservationRequest;
  let typeRoom: RoomType[];
  let services: Service[];
  let createdDog: Pet;

  beforeAll(async () => {
    await AppDataSource.initialize()
      .then((res) => {
        connection = res;
      })
      .catch((err) => {
        console.error("Error during Data Source Initialization", err);
      });

    await insertRoomTypes(AppDataSource);
    await insertRooms(AppDataSource);
    await insertServices(AppDataSource);

    await request(app).post("/users").send(mockedUser);
    await request(app).post("/users").send(mockedAdmin);

    const loginResponse = await request(app)
      .post("/login")
      .send(mockedUserLogin);

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

  test("POST /reviews - should not be able to register a review if not authenticaded", async () => {
    const response = await request(app).post("/reviews").send(mockedReview);

    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(401);
  });

  test("POST /reviews - should not be able to a register a review if not have review text", async () => {
    const userLoginResponse = await request(app)
      .post("/login")
      .send(mockedAdminLogin);
    const response = await request(app)
      .post("/reviews")
      .set("Authorization", `Bearer ${userLoginResponse.body.token}`)
      .send(mockedReviewInvalidTextWithout);

    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(400);
  });

  test("POST /reviews - should not be able to a register a review if not have stars", async () => {
    const userLoginResponse = await request(app)
      .post("/login")
      .send(mockedAdminLogin);
    const response = await request(app)
      .post("/reviews")
      .set("Authorization", `Bearer ${userLoginResponse.body.token}`)
      .send(mockedReviewInvalidStarsWithout);

    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(400);
  });

  test("POST /reviews - should not be able to register a rating of stars more than 5 stars", async () => {
    const userLoginResponse = await request(app)
      .post("/login")
      .send(mockedAdminLogin);
    const response = await request(app)
      .post("/reviews")
      .set("Authorization", `Bearer ${userLoginResponse.body.token}`)
      .send(mockedReviewInvalidStarsSix);

    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(400);
  });

  test("POST /reviews - should not be able to record a star rating of less than 1 star", async () => {
    const userLoginResponse = await request(app)
      .post("/login")
      .send(mockedAdminLogin);
    const response = await request(app)
      .post("/reviews")
      .set("Authorization", `Bearer ${userLoginResponse.body.token}`)
      .send(mockedReviewInvalidStarZero);

    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(400);
  });

  test("POST /reviews - should be able to register a new review", async () => {
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

    const mockRev = { ...mockedReview };
    mockRev.reservation_id = response.body.id;

    const responseReview = await request(app)
      .post("/reviews")
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .send(mockRev);

    expect(responseReview.body).toHaveProperty("id");
    expect(responseReview.body).toHaveProperty("review_text");
    expect(responseReview.body).toHaveProperty("stars");
    expect(responseReview.body.review_text).toEqual(mockRev.review_text);
    expect(responseReview.body.stars).toEqual(mockRev.stars);
    expect(responseReview.status).toBe(201);
  });

  test("GET /reviews - should be able to list a reviews", async () => {
    const loginResponse = await request(app)
      .post("/login")
      .send(mockedUserLogin);
    const response = await request(app)
      .get("/reviews")
      .set("Authorization", `Bearer ${loginResponse.body.token}`);

    expect(response.body[0]).toHaveProperty("id");
    expect(response.body[0]).toHaveProperty("review_text");
    expect(response.body[0]).toHaveProperty("stars");
    expect(response.status).toBe(200);
  });

  test("PATCH /reviews/:id - should be able to edit a review", async () => {
    const loginResponse = await request(app)
      .post("/login")
      .send(mockedUserLogin);
    const editReview = await request(app).get("/reviews");

    const response = await request(app)
      .patch(`/reviews/${editReview.body[0].id}`)
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .send(mockedEditReview);

    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("review_text");
    expect(response.body).toHaveProperty("stars");
    expect(response.body.review_text).toEqual(mockedEditReview.review_text);
    expect(response.body.stars).toEqual(mockedEditReview.stars);
    expect(response.status).toBe(200);
  });

  test("PATCH /reviews/:id - should only be able to edit a review with authentication", async () => {
    const loginResponse = await request(app)
      .post("/login")
      .send(mockedUserLogin);
    const editReview = await request(app).get("/reviews");
    const response = await request(app)
      .patch(`/reviews/${editReview.body[0].id}`)
      .send(mockedEditReview);

    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(401);
  });

  test("PATCH /reviews/:id - admin should be able to edit any review", async () => {
    const loginResponse = await request(app)
      .post("/login")
      .send(mockedAdminLogin);
    const editReview = await request(app).get("/reviews");

    const mockEditAdmin = { ...mockedEditReview };
    mockEditAdmin.review_text = "Edit with admin User!";
    mockEditAdmin.stars = 5;

    const response = await request(app)
      .patch(`/reviews/${editReview.body[0].id}`)
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .send(mockEditAdmin);

    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("review_text");
    expect(response.body).toHaveProperty("stars");
    expect(response.body.review_text).toEqual(mockEditAdmin.review_text);
    expect(response.body.stars).toEqual(mockEditAdmin.stars);
    expect(response.status).toBe(200);
  });

  test("PATCH /reviews/:id - should not be possible to edit review with more than 5 stars", async () => {
    const loginResponse = await request(app)
      .post("/login")
      .send(mockedAdminLogin);
    const editReview = await request(app).get("/reviews");

    const mockEditAdmin = { ...mockedEditReview };
    mockEditAdmin.review_text = "Edit with admin User!";
    mockEditAdmin.stars = 6;

    const response = await request(app)
      .patch(`/reviews/${editReview.body[0].id}`)
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .send(mockEditAdmin);

    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(400);
  });

  test("PATCH /reviews/:id - should not be possible to edit a review with less than 1 star", async () => {
    const loginResponse = await request(app)
      .post("/login")
      .send(mockedAdminLogin);
    const editReview = await request(app).get("/reviews");

    const mockEditAdmin = { ...mockedEditReview };
    mockEditAdmin.review_text = "Edit with admin User!";
    mockEditAdmin.stars = 0;

    const response = await request(app)
      .patch(`/reviews/${editReview.body[0].id}`)
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .send(mockEditAdmin);

    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(400);
  });

  test("DELETE /reviews/:id - should be able to delete a review with authentication", async () => {
    const loginResponse = await request(app)
      .post("/login")
      .send(mockedUserLogin);
    const deleteReview = await request(app).get("/reviews");
    const response = await request(app).delete(
      `/reviews/${deleteReview.body[0].id}`
    );

    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(401);
  });

  test("DELETE /reviews/:id - should be able to delete a review", async () => {
    const loginResponse = await request(app)
      .post("/login")
      .send(mockedUserLogin);
    const response = await request(app)
      .get("/reviews")
      .set("Authorization", `Bearer ${loginResponse.body.token}`);
    const responseDelete = await request(app)
      .delete(`/reviews/${response.body[0].id}`)
      .set("Authorization", `Bearer ${loginResponse.body.token}`);

    expect(responseDelete.status).toBe(204);
  });

  test("DELETE /reviews/:id - should be able to delete any review if ADM", async () => {
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
    const mockRev = { ...mockedReview };
    mockRev.reservation_id = response.body.id;
    const responseReview = await request(app)
      .post("/reviews")
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .send(mockRev);

    const loginAdminResponse = await request(app)
      .post("/login")
      .send(mockedAdminLogin);
    const deleteAdminReview = await request(app)
      .get("/reviews")
      .set("Authorization", `Bearer ${loginAdminResponse.body.token}`);
    const responseDelete = await request(app)
      .delete(`/reviews/${deleteAdminReview.body[0].id}`)
      .set("Authorization", `Bearer ${loginAdminResponse.body.token}`);

    expect(responseDelete.status).toBe(204);
  });
});
