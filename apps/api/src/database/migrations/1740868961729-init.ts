import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1740868961729 implements MigrationInterface {
    name = 'Init1740868961729'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "resource_usage" ("id" SERIAL NOT NULL, "resourceId" integer NOT NULL, "userId" integer, "startTime" TIMESTAMP NOT NULL DEFAULT now(), "startNotes" text, "endTime" TIMESTAMP, "endNotes" text, "duration" double precision NOT NULL DEFAULT '0', CONSTRAINT "PK_a8579e659abf174dda72abfec96" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "revoked_token" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "token" character varying NOT NULL, "tokenId" character varying NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "revokedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_bf300a6daf55d675aba672ba1f7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."authentication_detail_type_enum" AS ENUM('local_password', 'google', 'github')`);
        await queryRunner.query(`CREATE TABLE "authentication_detail" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "type" "public"."authentication_detail_type_enum" NOT NULL, "password" character varying, CONSTRAINT "PK_72c5036de8e6adf3ceeb02e82d3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "resource_introduction_user" ("id" SERIAL NOT NULL, "resourceId" integer NOT NULL, "userId" integer NOT NULL, "grantedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b08656c333569e63779fe6ff605" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "username" character varying NOT NULL, "email" character varying NOT NULL, "isEmailVerified" boolean NOT NULL DEFAULT false, "emailVerificationToken" text, "emailVerificationTokenExpiresAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "systemPermissionsCanmanageresources" boolean NOT NULL DEFAULT false, "systemPermissionsCanmanageusers" boolean NOT NULL DEFAULT false, "systemPermissionsCanmanagepermissions" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."resource_introduction_history_item_action_enum" AS ENUM('revoke', 'unrevoke')`);
        await queryRunner.query(`CREATE TABLE "resource_introduction_history_item" ("id" SERIAL NOT NULL, "introductionId" integer NOT NULL, "action" "public"."resource_introduction_history_item_action_enum" NOT NULL, "performedByUserId" integer NOT NULL, "comment" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9751c0cd09fa8d2b2768dff86d0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "resource_introduction" ("id" SERIAL NOT NULL, "resourceId" integer NOT NULL, "receiverUserId" integer NOT NULL, "tutorUserId" integer, "completedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1d9f7f69fee722f8125cffeec80" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "resource" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" text, "imageFilename" text, "totalUsageHours" double precision NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e2894a5867e06ae2e8889f1173f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "resource_usage" ADD CONSTRAINT "FK_8177b2b424a6d31c533d57b95cc" FOREIGN KEY ("resourceId") REFERENCES "resource"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "resource_usage" ADD CONSTRAINT "FK_6f80e3fc0cf8bfce60e25a6805f" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "revoked_token" ADD CONSTRAINT "FK_9441609ff7307fb73d22eed453d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "authentication_detail" ADD CONSTRAINT "FK_65a0cb4c981b2ebe57d4c546fda" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "resource_introduction_user" ADD CONSTRAINT "FK_1965529b5359163f498e97b6979" FOREIGN KEY ("resourceId") REFERENCES "resource"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "resource_introduction_user" ADD CONSTRAINT "FK_12a2193fc2a76b7cbc8fcb1aef8" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "resource_introduction_history_item" ADD CONSTRAINT "FK_d8111a1260c0438d095303dc136" FOREIGN KEY ("introductionId") REFERENCES "resource_introduction"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "resource_introduction_history_item" ADD CONSTRAINT "FK_6e8c08c535b7a63961699049cba" FOREIGN KEY ("performedByUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "resource_introduction" ADD CONSTRAINT "FK_1693bbfb15013a1ec119e9f9c0d" FOREIGN KEY ("resourceId") REFERENCES "resource"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "resource_introduction" ADD CONSTRAINT "FK_275626e28c839888d63e6a7d2c1" FOREIGN KEY ("receiverUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "resource_introduction" ADD CONSTRAINT "FK_bef5cdb0c4699414e813acfb683" FOREIGN KEY ("tutorUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "resource_introduction" DROP CONSTRAINT "FK_bef5cdb0c4699414e813acfb683"`);
        await queryRunner.query(`ALTER TABLE "resource_introduction" DROP CONSTRAINT "FK_275626e28c839888d63e6a7d2c1"`);
        await queryRunner.query(`ALTER TABLE "resource_introduction" DROP CONSTRAINT "FK_1693bbfb15013a1ec119e9f9c0d"`);
        await queryRunner.query(`ALTER TABLE "resource_introduction_history_item" DROP CONSTRAINT "FK_6e8c08c535b7a63961699049cba"`);
        await queryRunner.query(`ALTER TABLE "resource_introduction_history_item" DROP CONSTRAINT "FK_d8111a1260c0438d095303dc136"`);
        await queryRunner.query(`ALTER TABLE "resource_introduction_user" DROP CONSTRAINT "FK_12a2193fc2a76b7cbc8fcb1aef8"`);
        await queryRunner.query(`ALTER TABLE "resource_introduction_user" DROP CONSTRAINT "FK_1965529b5359163f498e97b6979"`);
        await queryRunner.query(`ALTER TABLE "authentication_detail" DROP CONSTRAINT "FK_65a0cb4c981b2ebe57d4c546fda"`);
        await queryRunner.query(`ALTER TABLE "revoked_token" DROP CONSTRAINT "FK_9441609ff7307fb73d22eed453d"`);
        await queryRunner.query(`ALTER TABLE "resource_usage" DROP CONSTRAINT "FK_6f80e3fc0cf8bfce60e25a6805f"`);
        await queryRunner.query(`ALTER TABLE "resource_usage" DROP CONSTRAINT "FK_8177b2b424a6d31c533d57b95cc"`);
        await queryRunner.query(`DROP TABLE "resource"`);
        await queryRunner.query(`DROP TABLE "resource_introduction"`);
        await queryRunner.query(`DROP TABLE "resource_introduction_history_item"`);
        await queryRunner.query(`DROP TYPE "public"."resource_introduction_history_item_action_enum"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "resource_introduction_user"`);
        await queryRunner.query(`DROP TABLE "authentication_detail"`);
        await queryRunner.query(`DROP TYPE "public"."authentication_detail_type_enum"`);
        await queryRunner.query(`DROP TABLE "revoked_token"`);
        await queryRunner.query(`DROP TABLE "resource_usage"`);
    }

}
