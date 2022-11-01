import { MigrationInterface, QueryRunner } from "typeorm";

export class initialMigration1667221589793 implements MigrationInterface {
  name = "initialMigration1667221589793";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "reviews" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "review_text" character varying NOT NULL, "stars" integer NOT NULL, "userId" uuid, CONSTRAINT "PK_231ae565c273ee700b283f15c1d" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(120) NOT NULL, "password" character varying NOT NULL, "email" character varying(120) NOT NULL, "is_adm" boolean NOT NULL DEFAULT false, "cpf" character varying, "profile_img" character varying, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "pets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(120) NOT NULL, "type" character varying NOT NULL, "age" character varying(120) NOT NULL, "neutered" boolean NOT NULL, "vaccinated" boolean NOT NULL, "docile" boolean NOT NULL, "userId" uuid, CONSTRAINT "PK_d01e9e7b4ada753c826720bee8b" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "room_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" character varying NOT NULL, "image" character varying NOT NULL, "capacity" integer NOT NULL, "price" numeric(8,2) NOT NULL, CONSTRAINT "UQ_fc67ea3909f97b058baa22d4867" UNIQUE ("title"), CONSTRAINT "PK_b6e1d0a9b67d4b9fbff9c35ab69" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "rooms" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "roomTypeId" uuid, CONSTRAINT "PK_0368a2d7c215f2d0458a54933f2" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "reservation_pets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "petId" uuid, "reservationId" uuid, "roomId" uuid, CONSTRAINT "PK_84a706499b4feb56a255abe64b0" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "services" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying NOT NULL, "price" numeric(8,2) NOT NULL, CONSTRAINT "UQ_019d74f7abcdcb5a0113010cb03" UNIQUE ("name"), CONSTRAINT "PK_ba2d347a3168a296416c6c5ccb2" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "reservation_services" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "amount" integer NOT NULL, "reservationId" uuid, "serviceId" uuid, CONSTRAINT "PK_4f6633abeabcab5b1c5c4288f19" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "reservations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "checkin" TIMESTAMP NOT NULL, "checkout" TIMESTAMP NOT NULL, "status" character varying NOT NULL DEFAULT 'reserved', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "reviewId" uuid, "userId" uuid, CONSTRAINT "REL_6092dc76fd1f8116f740083997" UNIQUE ("reviewId"), CONSTRAINT "PK_da95cef71b617ac35dc5bcda243" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "FK_7ed5659e7139fc8bc039198cc1f" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "pets" ADD CONSTRAINT "FK_a9f39dd54113410cdd3a04e80eb" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "rooms" ADD CONSTRAINT "FK_76b20e23154532d6fc4a0f0ea27" FOREIGN KEY ("roomTypeId") REFERENCES "room_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "reservation_pets" ADD CONSTRAINT "FK_aecbeebe0f6bf3c4d92364fa87a" FOREIGN KEY ("petId") REFERENCES "pets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "reservation_pets" ADD CONSTRAINT "FK_81a820f2774398377ae38d9ab12" FOREIGN KEY ("reservationId") REFERENCES "reservations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "reservation_pets" ADD CONSTRAINT "FK_0ffb69aca901348c9c776ec18ac" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "reservation_services" ADD CONSTRAINT "FK_28098e28e9c85e599ff425d211e" FOREIGN KEY ("reservationId") REFERENCES "reservations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "reservation_services" ADD CONSTRAINT "FK_979cfbd7a5e4170cc36e987d940" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "reservations" ADD CONSTRAINT "FK_6092dc76fd1f8116f740083997c" FOREIGN KEY ("reviewId") REFERENCES "reviews"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "reservations" ADD CONSTRAINT "FK_aa0e1cc2c4f54da32bf8282154c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reservations" DROP CONSTRAINT "FK_aa0e1cc2c4f54da32bf8282154c"`
    );
    await queryRunner.query(
      `ALTER TABLE "reservations" DROP CONSTRAINT "FK_6092dc76fd1f8116f740083997c"`
    );
    await queryRunner.query(
      `ALTER TABLE "reservation_services" DROP CONSTRAINT "FK_979cfbd7a5e4170cc36e987d940"`
    );
    await queryRunner.query(
      `ALTER TABLE "reservation_services" DROP CONSTRAINT "FK_28098e28e9c85e599ff425d211e"`
    );
    await queryRunner.query(
      `ALTER TABLE "reservation_pets" DROP CONSTRAINT "FK_0ffb69aca901348c9c776ec18ac"`
    );
    await queryRunner.query(
      `ALTER TABLE "reservation_pets" DROP CONSTRAINT "FK_81a820f2774398377ae38d9ab12"`
    );
    await queryRunner.query(
      `ALTER TABLE "reservation_pets" DROP CONSTRAINT "FK_aecbeebe0f6bf3c4d92364fa87a"`
    );
    await queryRunner.query(
      `ALTER TABLE "rooms" DROP CONSTRAINT "FK_76b20e23154532d6fc4a0f0ea27"`
    );
    await queryRunner.query(
      `ALTER TABLE "pets" DROP CONSTRAINT "FK_a9f39dd54113410cdd3a04e80eb"`
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_7ed5659e7139fc8bc039198cc1f"`
    );
    await queryRunner.query(`DROP TABLE "reservations"`);
    await queryRunner.query(`DROP TABLE "reservation_services"`);
    await queryRunner.query(`DROP TABLE "services"`);
    await queryRunner.query(`DROP TABLE "reservation_pets"`);
    await queryRunner.query(`DROP TABLE "rooms"`);
    await queryRunner.query(`DROP TABLE "room_types"`);
    await queryRunner.query(`DROP TABLE "pets"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "reviews"`);
  }
}
