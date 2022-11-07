import { MigrationInterface, QueryRunner } from "typeorm";

export class reviewStarsNullable1667844898611 implements MigrationInterface {
    name = 'reviewStarsNullable1667844898611'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reviews" ALTER COLUMN "stars" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reviews" ALTER COLUMN "stars" SET NOT NULL`);
    }

}
