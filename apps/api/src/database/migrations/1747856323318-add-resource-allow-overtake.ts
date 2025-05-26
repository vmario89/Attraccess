import { MigrationInterface, QueryRunner } from "typeorm";

export class AddResourceAllowOvertake1747856323318 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add allowOvertake column to resource table with default value false
        await queryRunner.query(`ALTER TABLE "resource" ADD "allowOvertake" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove allowOvertake column from resource table
        await queryRunner.query(`ALTER TABLE "resource" DROP COLUMN "allowOvertake"`);
    }

}