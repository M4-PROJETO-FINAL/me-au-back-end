import { MigrationInterface, QueryRunner } from "typeorm";

export class updateReview1667584712402 implements MigrationInterface {
    name = 'updateReview1667584712402'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reservation_services" DROP CONSTRAINT "FK_28098e28e9c85e599ff425d211e"`);
        await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "FK_7ed5659e7139fc8bc039198cc1f"`);
        await queryRunner.query(`ALTER TABLE "reservations" DROP CONSTRAINT "FK_6092dc76fd1f8116f740083997c"`);
        await queryRunner.query(`ALTER TABLE "reservations" DROP CONSTRAINT "FK_aa0e1cc2c4f54da32bf8282154c"`);
        await queryRunner.query(`ALTER TABLE "reservation_pets" DROP CONSTRAINT "FK_81a820f2774398377ae38d9ab12"`);
        await queryRunner.query(`ALTER TABLE "pets" DROP CONSTRAINT "FK_a9f39dd54113410cdd3a04e80eb"`);
        await queryRunner.query(`ALTER TABLE "reservations" DROP CONSTRAINT "REL_6092dc76fd1f8116f740083997"`);
        await queryRunner.query(`ALTER TABLE "reservations" DROP COLUMN "reviewId"`);
        await queryRunner.query(`ALTER TABLE "reviews" ADD "reservationId" uuid`);
        await queryRunner.query(`ALTER TABLE "reviews" ADD CONSTRAINT "UQ_6067e9120f35fc449acc410ec1a" UNIQUE ("reservationId")`);
        await queryRunner.query(`ALTER TABLE "reservation_services" ADD CONSTRAINT "FK_28098e28e9c85e599ff425d211e" FOREIGN KEY ("reservationId") REFERENCES "reservations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reviews" ADD CONSTRAINT "FK_6067e9120f35fc449acc410ec1a" FOREIGN KEY ("reservationId") REFERENCES "reservations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reviews" ADD CONSTRAINT "FK_7ed5659e7139fc8bc039198cc1f" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservations" ADD CONSTRAINT "FK_aa0e1cc2c4f54da32bf8282154c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservation_pets" ADD CONSTRAINT "FK_81a820f2774398377ae38d9ab12" FOREIGN KEY ("reservationId") REFERENCES "reservations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pets" ADD CONSTRAINT "FK_a9f39dd54113410cdd3a04e80eb" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pets" DROP CONSTRAINT "FK_a9f39dd54113410cdd3a04e80eb"`);
        await queryRunner.query(`ALTER TABLE "reservation_pets" DROP CONSTRAINT "FK_81a820f2774398377ae38d9ab12"`);
        await queryRunner.query(`ALTER TABLE "reservations" DROP CONSTRAINT "FK_aa0e1cc2c4f54da32bf8282154c"`);
        await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "FK_7ed5659e7139fc8bc039198cc1f"`);
        await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "FK_6067e9120f35fc449acc410ec1a"`);
        await queryRunner.query(`ALTER TABLE "reservation_services" DROP CONSTRAINT "FK_28098e28e9c85e599ff425d211e"`);
        await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "UQ_6067e9120f35fc449acc410ec1a"`);
        await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "reservationId"`);
        await queryRunner.query(`ALTER TABLE "reservations" ADD "reviewId" uuid`);
        await queryRunner.query(`ALTER TABLE "reservations" ADD CONSTRAINT "REL_6092dc76fd1f8116f740083997" UNIQUE ("reviewId")`);
        await queryRunner.query(`ALTER TABLE "pets" ADD CONSTRAINT "FK_a9f39dd54113410cdd3a04e80eb" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservation_pets" ADD CONSTRAINT "FK_81a820f2774398377ae38d9ab12" FOREIGN KEY ("reservationId") REFERENCES "reservations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservations" ADD CONSTRAINT "FK_aa0e1cc2c4f54da32bf8282154c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservations" ADD CONSTRAINT "FK_6092dc76fd1f8116f740083997c" FOREIGN KEY ("reviewId") REFERENCES "reviews"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reviews" ADD CONSTRAINT "FK_7ed5659e7139fc8bc039198cc1f" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservation_services" ADD CONSTRAINT "FK_28098e28e9c85e599ff425d211e" FOREIGN KEY ("reservationId") REFERENCES "reservations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
