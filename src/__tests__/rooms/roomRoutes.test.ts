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
import { Pet } from "../../entities/pet.entity";
import { IReservationRequest } from "../../interfaces/reservations";
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
  });

  test("GET /rooms/dates/:roomTypeId - two pets in the same reservation requested in the same room type should be put in the same room together", async () => {
    // esse teste na verdade testa a rota POST /reservations
    // deve ser movido para lá, uma vez que a rota GET /rooms/dates/:roomTypeId
    // já está confiável
    await occupy2CatRoomsWith4Cats();
    const roomTypeRepository = AppDataSource.getRepository(RoomType);
    const catRoom = await roomTypeRepository.findOneBy({
      title: "Quarto Privativo (gatos)",
    });

    const response = await request(app).get(`/rooms/dates/${catRoom!.id}`);

    expect(response.body.length).toEqual(0);
  });
});

async function put20DogsInTheSharedRoom() {
  const token = (await request(app).post("/login").send(mockedUserLogin)).body
    .token;
  const dogs = await register20Dogs(token);
  await make20Reservations(dogs, token);
}

async function register20Dogs(token: string): Promise<Pet[]> {
  const dogs: Pet[] = [];
  for (let i = 1; i <= 20; i++) {
    const newDog = {
      name: `Doguinho ${i}`,
      type: "dog",
      age: "1 ano",
      neutered: true,
      vaccinated: true,
      docile: true,
    } as Pet;
    const response = await request(app)
      .post("/pets")
      .set("Authorization", `Bearer ${token}`)
      .send(newDog);
    dogs.push(response.body);
  }

  return dogs;
}

async function make20Reservations(dogs: Pet[], token: string) {
  const roomTypeRepository = AppDataSource.getRepository(RoomType);
  const sharedRoom = await roomTypeRepository.findOneBy({
    title: "Quarto Compartilhado",
  });
  // first half of the resevations will be for [2023-01-17, 2023-01-22]
  // other half will be for [2023-01-20, 2023-01-22]
  // expected dates when room is full: 2023-01-20, 2023-01-21
  const firstHalf = dogs.slice(0, 10);
  for (let i = 0; i < firstHalf.length; i++) {
    const dog = firstHalf[i];
    const reservationRequest = {
      checkin: "2023-01-17",
      checkout: "2023-01-22",
      pet_rooms: [
        {
          pet_id: dog.id,
          room_type_id: sharedRoom!.id,
        },
      ],
    } as IReservationRequest;
    await request(app)
      .post("/reservations")
      .set("Authorization", `Bearer ${token}`)
      .send(reservationRequest);
  }

  const secondHalf = dogs.slice(10);
  for (let i = 0; i < secondHalf.length; i++) {
    const dog = secondHalf[i];
    const reservationRequest = {
      checkin: "2023-01-20",
      checkout: "2023-01-22",
      pet_rooms: [
        {
          pet_id: dog.id,
          room_type_id: sharedRoom!.id,
        },
      ],
    } as IReservationRequest;
    await request(app)
      .post("/reservations")
      .set("Authorization", `Bearer ${token}`)
      .send(reservationRequest);
  }
}

async function occupy4CatRooms() {
  const token = (await request(app).post("/login").send(mockedUserLogin)).body
    .token;
  const cats = await register4Cats(token);
  await make4CatRoomReservations(cats, token);
}

async function occupy2CatRoomsWith4Cats() {
  const token = (await request(app).post("/login").send(mockedUserLogin)).body
    .token;
  const cats = await register4Cats(token);
  await make2ReservationsFor4Cats(cats, token);
}

async function register4Cats(token: string): Promise<Pet[]> {
  const cats: Pet[] = [];
  for (let i = 1; i <= 4; i++) {
    const newCat = {
      name: `Gatinho ${i}`,
      type: "cat",
      age: "1 ano",
      neutered: true,
      vaccinated: true,
      docile: true,
    } as Pet;
    const response = await request(app)
      .post("/pets")
      .set("Authorization", `Bearer ${token}`)
      .send(newCat);
    cats.push(response.body);
  }

  return cats;
}

async function make4CatRoomReservations(cats: Pet[], token: string) {
  const roomTypeRepository = AppDataSource.getRepository(RoomType);
  const catRoom = await roomTypeRepository.findOneBy({
    title: "Quarto Privativo (gatos)",
  });

  for (let i = 0; i < cats.length; i++) {
    const cat = cats[i];
    const reservationRequest = {
      checkin: "2023-01-13",
      checkout: "2023-01-16",
      pet_rooms: [
        {
          pet_id: cat.id,
          room_type_id: catRoom!.id,
        },
      ],
    } as IReservationRequest;
    await request(app)
      .post("/reservations")
      .set("Authorization", `Bearer ${token}`)
      .send(reservationRequest);
  }
}

async function make2ReservationsFor4Cats(cats: Pet[], token: string) {
  if (cats.length !== 4) return console.error("cats should be of length 4");

  const roomTypeRepository = AppDataSource.getRepository(RoomType);
  const catRoom = await roomTypeRepository.findOneBy({
    title: "Quarto Privativo (gatos)",
  });

  const reservationRequest1 = {
    checkin: "2023-01-13",
    checkout: "2023-01-16",
    pet_rooms: [
      {
        pet_id: cats[0].id,
        room_type_id: catRoom!.id,
      },
      {
        pet_id: cats[1].id,
        room_type_id: catRoom!.id,
      },
    ],
  } as IReservationRequest;
  const reservationRequest2 = {
    checkin: "2023-01-13",
    checkout: "2023-01-16",
    pet_rooms: [
      {
        pet_id: cats[2].id,
        room_type_id: catRoom!.id,
      },
      {
        pet_id: cats[3].id,
        room_type_id: catRoom!.id,
      },
    ],
  } as IReservationRequest;
  await request(app)
    .post("/reservations")
    .set("Authorization", `Bearer ${token}`)
    .send(reservationRequest1);
  await request(app)
    .post("/reservations")
    .set("Authorization", `Bearer ${token}`)
    .send(reservationRequest2);
}
