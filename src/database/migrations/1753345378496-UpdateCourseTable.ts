import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateCourseTable1753345378496 implements MigrationInterface {
    name = 'UpdateCourseTable1753345378496'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "PK_3f70a487cc718ad8eda4e6d58c9"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "courses" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "PK_3f70a487cc718ad8eda4e6d58c9" PRIMARY KEY ("id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "PK_3f70a487cc718ad8eda4e6d58c9"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "courses" ADD "id" character varying(256) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "PK_3f70a487cc718ad8eda4e6d58c9" PRIMARY KEY ("id")`);
    }

}
