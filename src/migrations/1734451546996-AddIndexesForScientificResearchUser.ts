import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIndexesForScientificResearchUser1734451546996 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Tạo chỉ mục idx_scientificResearch_user trên scientificResearchId và userId
        await queryRunner.query(`
        CREATE INDEX "idx_scientificResearch_user" ON "scientific_research_user" ("scientificResearchId", "userId");
      `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Hủy bỏ chỉ mục
        await queryRunner.query('DROP INDEX "idx_scientificResearch_user";');
    }

}
