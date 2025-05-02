import { MigrationInterface, QueryRunner } from "typeorm";

export class NfcCardKeyPrefix1746124521038 implements MigrationInterface {
    name = 'NfcCardKeyPrefix1746124521038'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_nfc_card" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "uid" text NOT NULL, "userId" integer NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "key_0" text NOT NULL DEFAULT ('0000000000000000'))`);
        await queryRunner.query(`INSERT INTO "temporary_nfc_card"("id", "uid", "userId", "createdAt", "updatedAt", "key_0") SELECT "id", "uid", "userId", "createdAt", "updatedAt", "0" FROM "nfc_card"`);
        await queryRunner.query(`DROP TABLE "nfc_card"`);
        await queryRunner.query(`ALTER TABLE "temporary_nfc_card" RENAME TO "nfc_card"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nfc_card" RENAME TO "temporary_nfc_card"`);
        await queryRunner.query(`CREATE TABLE "nfc_card" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "uid" text NOT NULL, "userId" integer NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "0" text NOT NULL DEFAULT ('0000000000000000'))`);
        await queryRunner.query(`INSERT INTO "nfc_card"("id", "uid", "userId", "createdAt", "updatedAt", "0") SELECT "id", "uid", "userId", "createdAt", "updatedAt", "key_0" FROM "temporary_nfc_card"`);
        await queryRunner.query(`DROP TABLE "temporary_nfc_card"`);
    }

}
