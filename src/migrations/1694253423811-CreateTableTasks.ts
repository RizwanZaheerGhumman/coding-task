import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableTasks1694253423811 implements MigrationInterface {
  name = 'CreateTableTasks1694253423811';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "tasks"
             (
                 "id"        SERIAL    NOT NULL,
                 "name"      citext    NOT NULL,
                 "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                 "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                 CONSTRAINT "UQ_396d500ff7f1b82771ddd812fd1" UNIQUE ("name"),
                 CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id")
             )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "tasks"`);
  }
}
