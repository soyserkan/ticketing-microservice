import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrate1710676304667 implements MigrationInterface {
    name = 'Migrate1710676304667'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "order" ("id" integer NOT NULL, "user_id" integer NOT NULL, "status" character varying NOT NULL DEFAULT 'created', "version" integer NOT NULL, "price" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "order"`);
    }

}
