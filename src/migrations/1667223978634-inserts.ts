import { MigrationInterface, QueryRunner } from "typeorm";

export class inserts1667223978634 implements MigrationInterface {
  name = "inserts1667223978634";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "services" ("name", "description", "price") VALUES ('Vacina', 'Vacinação para seu pet, com preço a combinar (dependendo de qual a vacina)', 0), ('Banho', 'Banho para deixar o seu pet cheirosinho!', 30), ('Tosa', 'Tosa completa para deixar seu pet no estilo', 30), ('Massagem', 'Uma sessão relaxante de massagem', 60), ('Natação', 'Aula de natação em uma piscina enorme e aquecida', 50), ('Ração', 'Uma porção de ração premium gourmet', 10)`
    );

    await queryRunner.query(
      `INSERT INTO "room_types" ("title", "description", "image", "capacity", "price") VALUES ('Quarto Compartilhado', 'Ótimo custo benefício, essa opção é ideal para você que deseja que o seu pet interaja com outros catioros!', 'https://storage.googleapis.com/cmsapi.sistema.cim.br/C-307MMTG2XWCYRO/2021-05/ZFS0iTHLKOmnOZCa3eB2FlX0/html_content.jpeg?v=20220627161024', 20, 120), ('Quarto Privativo (cães)', 'Busca conforto e privacidade para o seu cãozinho? O quarto privativo é a opção ideal!', 'https://static.wixstatic.com/media/3c9e04_9e67eefb471c48b483a4aba70236fb3e~mv2_d_5175_3450_s_4_2.jpg/v1/fill/w_587,h_444,q_85,usm_0.66_1.00_0.01/3c9e04_9e67eefb471c48b483a4aba70236fb3e~mv2_d_5175_3450_s_4_2.jpg', 2, 250), ('Quarto Privativo (gatos)', 'Quarto privativo de alto padrão para o seu felino aproveitar com classe!', 'https://static.wixstatic.com/media/3c9e04_e6167e6e41a8456584250793ba200198~mv2_d_5093_3395_s_4_2.jpg/v1/fill/w_587,h_444,q_85,usm_0.66_1.00_0.01/3c9e04_e6167e6e41a8456584250793ba200198~mv2_d_5093_3395_s_4_2.jpg', 2, 250 )`
    );

    await queryRunner.query(
      `INSERT INTO "rooms" ("roomTypeId") SELECT "id" FROM "room_types" WHERE "title" = 'Quarto Compartilhado'`
    );

    await queryRunner.query(
      `INSERT INTO "rooms" ("roomTypeId") SELECT "id" FROM "room_types" WHERE "title" = 'Quarto Privativo (cães)'`
    );
    await queryRunner.query(
      `INSERT INTO "rooms" ("roomTypeId") SELECT "id" FROM "room_types" WHERE "title" = 'Quarto Privativo (cães)'`
    );
    await queryRunner.query(
      `INSERT INTO "rooms" ("roomTypeId") SELECT "id" FROM "room_types" WHERE "title" = 'Quarto Privativo (cães)'`
    );
    await queryRunner.query(
      `INSERT INTO "rooms" ("roomTypeId") SELECT "id" FROM "room_types" WHERE "title" = 'Quarto Privativo (cães)'`
    );

    await queryRunner.query(
      `INSERT INTO "rooms" ("roomTypeId") SELECT "id" FROM "room_types" WHERE "title" = 'Quarto Privativo (gatos)'`
    );
    await queryRunner.query(
      `INSERT INTO "rooms" ("roomTypeId") SELECT "id" FROM "room_types" WHERE "title" = 'Quarto Privativo (gatos)'`
    );
    await queryRunner.query(
      `INSERT INTO "rooms" ("roomTypeId") SELECT "id" FROM "room_types" WHERE "title" = 'Quarto Privativo (gatos)'`
    );
    await queryRunner.query(
      `INSERT INTO "rooms" ("roomTypeId") SELECT "id" FROM "room_types" WHERE "title" = 'Quarto Privativo (gatos)'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "services"`);
    await queryRunner.query(`DELETE FROM "room_types"`);
    await queryRunner.query(`DELETE FROM "rooms"`);
  }
}
