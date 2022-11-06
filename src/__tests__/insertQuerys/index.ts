import request from "supertest";
import { DataSource } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import app from "../../app";
import AppDataSource from "../../data-source";
import { Pet } from "../../entities/pet.entity";
import { RoomType } from "../../entities/roomType.entity";
import { IReservationRequest } from "../../interfaces/reservations";
import { mockedUserLogin } from "../mocks";

export const insertRoomTypes = async (dataSource: DataSource) => {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.manager.query(
    `INSERT INTO "room_types" ("id", "title", "description", "image", "capacity", "price") VALUES ('${uuidv4()}', 'Quarto Compartilhado', 'Ótimo custo benefício, essa opção é ideal para você que deseja que o seu pet interaja com outros catioros!', 'https://storage.googleapis.com/cmsapi.sistema.cim.br/C-307MMTG2XWCYRO/2021-05/ZFS0iTHLKOmnOZCa3eB2FlX0/html_content.jpeg?v=20220627161024', 20, 120), ('${uuidv4()}', 'Quarto Privativo (cães)', 'Busca conforto e privacidade para o seu cãozinho? O quarto privativo é a opção ideal!', 'https://static.wixstatic.com/media/3c9e04_9e67eefb471c48b483a4aba70236fb3e~mv2_d_5175_3450_s_4_2.jpg/v1/fill/w_587,h_444,q_85,usm_0.66_1.00_0.01/3c9e04_9e67eefb471c48b483a4aba70236fb3e~mv2_d_5175_3450_s_4_2.jpg', 2, 250), ('${uuidv4()}', 'Quarto Privativo (gatos)', 'Quarto privativo de alto padrão para o seu felino aproveitar com classe!', 'https://static.wixstatic.com/media/3c9e04_e6167e6e41a8456584250793ba200198~mv2_d_5093_3395_s_4_2.jpg/v1/fill/w_587,h_444,q_85,usm_0.66_1.00_0.01/3c9e04_e6167e6e41a8456584250793ba200198~mv2_d_5093_3395_s_4_2.jpg', 2, 250 )`
  );
};

export const insertRooms = async (dataSource: DataSource) => {
  const queryRunner = dataSource.createQueryRunner();
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
};

export const insertServices = async (dataSource: DataSource) => {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.manager.query(
    `INSERT INTO "services" ("id", "name", "description", "price") 
    VALUES 
    ('${uuidv4()}', 'Vacina', 'Vacinação para seu pet, com preço a combinar (dependendo de qual a vacina)', 0), 
    ('${uuidv4()}', 'Banho', 'Banho para deixar o seu pet cheirosinho!', 30), 
    ('${uuidv4()}', 'Tosa', 'Tosa completa para deixar seu pet no estilo', 30), 
    ('${uuidv4()}', 'Massagem', 'Uma sessão relaxante de massagem', 60), 
    ('${uuidv4()}', 'Natação', 'Aula de natação em uma piscina enorme e aquecida', 50), 
    ('${uuidv4()}', 'Ração', 'Uma porção de ração premium gourmet', 10)`
  );
};

export async function put20DogsInTheSharedRoom() {
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

export async function occupy4CatRooms() {
  const token = (await request(app).post("/login").send(mockedUserLogin)).body
    .token;
  const cats = await register4Cats(token);
  await make4CatRoomReservations(cats, token);
}

export async function occupy2CatRoomsWith4Cats() {
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
