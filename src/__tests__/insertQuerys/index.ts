import { DataSource } from "typeorm";
import { v4 as uuidv4 } from "uuid";

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
