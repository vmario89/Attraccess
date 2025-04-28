import { MigrationInterface, QueryRunner } from "typeorm";

export class PluginConfiguration1745256929836 implements MigrationInterface {
    name = 'PluginConfiguration1745256929836'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "plugin_configuration" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "fsPath" varchar NOT NULL, "enabled" boolean NOT NULL DEFAULT (0), "lastLoadWasSuccessfull" boolean NOT NULL DEFAULT (0), "lastLoadErrorMessage" text DEFAULT ('NO LOAD ATTEMPTED YET'))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "plugin_configuration"`);
    }

}
