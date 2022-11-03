import request from "supertest";
import { DataSource } from "typeorm";
import app from "../../app";
import AppDataSource from "../../data-source";
import { IReviewRequest } from "../../interfaces/reviews";
import {
  mockedAdmin,
  mockedAdminLogin,
  mockedReview,
  mockedReviewInvalidStarZero,
  mockedReviewInvalidStarsSix,
  mockedReviewInvalidStarsWithout,
  mockedReviewInvalidTextWithout,
} from "../mocks";

describe("/reviews", () => {
  let connection: DataSource;
  let userCreatedReviews: IReviewRequest;

  beforeAll(async () => {
    await AppDataSource.initialize()
      .then((res) => {
        connection = res;
      })
      .catch((err) => {
        console.error("Error during Data Source Initialization", err);
      });
    await request(app).post("/users").send(mockedAdmin);
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

  test("POST /reviews - must not be able to record a star rating of less than 1 star", async () => {
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
    const userLoginResponse = await request(app)
      .post("/login")
      .send(mockedAdminLogin);
    const response = await request(app)
      .post("/reviews")
      .set("Authorization", `Bearer ${userLoginResponse.body.token}`)
      .send(mockedReview);

    expect(response.body).toHaveProperty("id");
    expect(response.body.review_text).toEqual(mockedReview.review_text);
    expect(response.body).toHaveProperty("id");
    expect(response.body.stars).toEqual(mockedReview.stars);
    expect(response.status).toBe(201);
  });

  test("GET /reviews - should be able to list a reviews", async () => {
    const userLoginResponse = await request(app)
      .post("/login")
      .send(mockedAdminLogin);
    const response = await request(app)
      .get("/reviews")
      .set("Authorization", `Bearer ${userLoginResponse.body.token}`);

    expect(response.body.length).toEqual(1);
    expect(response.body[0]).toHaveProperty("id");
    expect(response.body[0].review_text).toBe(mockedReview.review_text);
    expect(response.body[0].stars).toBe(mockedReview.stars);
    expect(response.status).toBe(200);
  });
});
