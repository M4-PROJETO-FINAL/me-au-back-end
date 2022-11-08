import { MigrationInterface, QueryRunner } from "typeorm";

export class decimalReview1667836218387 implements MigrationInterface {
    name = 'decimalReview1667836218387'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "stars"`);
        await queryRunner.query(`ALTER TABLE "reviews" ADD "stars" numeric(2,1) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "stars"`);
        await queryRunner.query(`ALTER TABLE "reviews" ADD "stars" integer NOT NULL`);
    }

}
