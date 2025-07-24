import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAcademicPeriodTable1753369359129 implements MigrationInterface {
    name = 'CreateAcademicPeriodTable1753369359129'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "academic_periods" ("id" character varying(255) NOT NULL, "name" character varying(255) NOT NULL, "startDate" TIMESTAMP WITH TIME ZONE NOT NULL, "endDate" TIMESTAMP WITH TIME ZONE NOT NULL, "calendarYear" integer NOT NULL, "semesterNumber" integer NOT NULL, CONSTRAINT "PK_911f414fba24e3855a5ba1f51ad" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "academic_periods"`);
    }

}
