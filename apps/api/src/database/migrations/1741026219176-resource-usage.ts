import { MigrationInterface, QueryRunner } from "typeorm";

export class ResourceUsage1741026219176 implements MigrationInterface {
    name = 'ResourceUsage1741026219176'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "resource_usage" RENAME COLUMN "duration" TO "usageInMinutes"`);
        await queryRunner.query(`ALTER TABLE "resource" DROP COLUMN "totalUsageHours"`);
        await queryRunner.query(`ALTER TABLE "resource_usage" DROP COLUMN "usageInMinutes"`);
        await queryRunner.query(`ALTER TABLE "resource_usage" ADD "usageInMinutes" integer GENERATED ALWAYS AS (CASE 
      WHEN "endTime" IS NULL THEN -1
      ELSE EXTRACT(EPOCH FROM ("endTime" - "startTime")) / 60
    END) STORED NOT NULL`);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES ($1, $2, $3, $4, $5, $6)`, ["attraccess","public","resource_usage","GENERATED_COLUMN","usageInMinutes","CASE \n      WHEN \"endTime\" IS NULL THEN -1\n      ELSE EXTRACT(EPOCH FROM (\"endTime\" - \"startTime\")) / 60\n    END"]);
        await queryRunner.query(`CREATE VIEW "resource_computed_view" AS SELECT "resource"."id" AS "id", COALESCE(SUM("usage"."usageInMinutes"), -1) AS "totalUsageMinutes" FROM "resource" "resource" LEFT JOIN "resource_usage" "usage" ON "usage"."resourceId" = "resource"."id" GROUP BY "resource"."id"`);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`, ["public","VIEW","resource_computed_view","SELECT \"resource\".\"id\" AS \"id\", COALESCE(SUM(\"usage\".\"usageInMinutes\"), -1) AS \"totalUsageMinutes\" FROM \"resource\" \"resource\" LEFT JOIN \"resource_usage\" \"usage\" ON \"usage\".\"resourceId\" = \"resource\".\"id\" GROUP BY \"resource\".\"id\""]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, ["VIEW","resource_computed_view","public"]);
        await queryRunner.query(`DROP VIEW "resource_computed_view"`);
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "database" = $3 AND "schema" = $4 AND "table" = $5`, ["GENERATED_COLUMN","usageInMinutes","attraccess","public","resource_usage"]);
        await queryRunner.query(`ALTER TABLE "resource_usage" DROP COLUMN "usageInMinutes"`);
        await queryRunner.query(`ALTER TABLE "resource_usage" ADD "usageInMinutes" double precision NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "resource" ADD "totalUsageHours" double precision NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "resource_usage" RENAME COLUMN "usageInMinutes" TO "duration"`);
    }

}
