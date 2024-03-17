import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrate1710678731698 implements MigrationInterface {
    name = 'Migrate1710678731698'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_38dbd68ceaf6a55c56729dfa9e2"`);
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "REL_38dbd68ceaf6a55c56729dfa9e"`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "FK_38dbd68ceaf6a55c56729dfa9e2" FOREIGN KEY ("ticketId") REFERENCES "ticket"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_38dbd68ceaf6a55c56729dfa9e2"`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "REL_38dbd68ceaf6a55c56729dfa9e" UNIQUE ("ticketId")`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "FK_38dbd68ceaf6a55c56729dfa9e2" FOREIGN KEY ("ticketId") REFERENCES "ticket"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
