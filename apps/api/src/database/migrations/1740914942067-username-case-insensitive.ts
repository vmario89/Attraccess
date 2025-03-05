import { MigrationInterface, QueryRunner } from 'typeorm';

export class UsernameCaseInsensitive1740914942067
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL: Add a case-insensitive unique index using LOWER function
    // First drop existing constraint
    await queryRunner.query(`
      DO $$
      BEGIN
          IF EXISTS (
              SELECT 1 FROM pg_constraint WHERE conname = 'UQ_user_username'
          ) THEN
              ALTER TABLE "user" DROP CONSTRAINT "UQ_user_username";
          END IF;
      END $$;
    `);

    // Add case-insensitive unique index
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_user_username_case_insensitive" ON "user" (LOWER(username));
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL: Remove the case-insensitive index and restore original constraint
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_user_username_case_insensitive"`
    );

    // Re-add the original constraint
    await queryRunner.query(`
      ALTER TABLE "user" ADD CONSTRAINT "UQ_user_username" UNIQUE ("username");
    `);
  }
}
