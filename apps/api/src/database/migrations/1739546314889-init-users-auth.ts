import { MigrationInterface, QueryRunner } from "typeorm";

export class InitUsersAuth1739546314889 implements MigrationInterface {
    name = 'InitUsersAuth1739546314889'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."authentication_detail_type_enum" AS ENUM('password')`);
        await queryRunner.query(`CREATE TABLE "authentication_detail" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "type" "public"."authentication_detail_type_enum" NOT NULL, "password" character varying, CONSTRAINT "PK_72c5036de8e6adf3ceeb02e82d3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "username" character varying NOT NULL, "email" character varying NOT NULL, "isEmailVerified" boolean NOT NULL DEFAULT false, "emailVerificationToken" character varying, "emailVerificationTokenExpiresAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "systemPermissionsCanmanageusers" boolean NOT NULL DEFAULT false, "systemPermissionsCanmanagemachinedefinitions" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "revoked_token" ("id" SERIAL NOT NULL, "tokenId" character varying NOT NULL, "revokedAt" TIMESTAMP NOT NULL DEFAULT now(), "expiresAt" TIMESTAMP NOT NULL, CONSTRAINT "UQ_c41902907d3f26c5a74b0f34489" UNIQUE ("tokenId"), CONSTRAINT "PK_bf300a6daf55d675aba672ba1f7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "authentication_detail" ADD CONSTRAINT "FK_65a0cb4c981b2ebe57d4c546fda" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "authentication_detail" DROP CONSTRAINT "FK_65a0cb4c981b2ebe57d4c546fda"`);
        await queryRunner.query(`DROP TABLE "revoked_token"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "authentication_detail"`);
        await queryRunner.query(`DROP TYPE "public"."authentication_detail_type_enum"`);
    }

}
