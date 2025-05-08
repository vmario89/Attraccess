import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1745783167785 implements MigrationInterface {
    name = 'Init1745783167785'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "reader" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" text NOT NULL, "apiTokenHash" text NOT NULL, "hasAccessToResourceIds" text NOT NULL DEFAULT (''), "lastConnection" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "firstConnection" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP))`);
        await queryRunner.query(`CREATE TABLE "nfc_card" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "uid" text NOT NULL, "userId" integer NOT NULL, "verificationToken" text NOT NULL, "antiDuplicationToken" text NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "0" text NOT NULL, "1" text NOT NULL, "2" text NOT NULL, "3" text NOT NULL, "4" text NOT NULL)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "nfc_card"`);
        await queryRunner.query(`DROP TABLE "reader"`);
    }

}
