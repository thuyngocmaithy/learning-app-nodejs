import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIndexesForScientificResearch1734451631410 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Tạo chỉ mục idx_status_id
        await queryRunner.query(`
          CREATE INDEX "idx_status_id" ON "scientific_research" ("statusId");
        `);

        // Tạo chỉ mục idx_instructor
        await queryRunner.query(`
          CREATE INDEX "idx_instructor" ON "scientific_research" ("instructorId");
        `);

        // Tạo chỉ mục idx_createUser
        await queryRunner.query(`
          CREATE INDEX "idx_createUser" ON "scientific_research" ("createUserId");
        `);

        // Tạo chỉ mục idx_lastModifyUser
        await queryRunner.query(`
          CREATE INDEX "idx_lastModifyUser" ON "scientific_research" ("lastModifyUserId");
        `);

        // Tạo chỉ mục idx_scientificResearchGroup
        await queryRunner.query(`
          CREATE INDEX "idx_scientificResearchGroup" ON "scientific_research" ("scientificResearchGroupId");
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Hủy bỏ chỉ mục idx_status_id
        await queryRunner.query('DROP INDEX "idx_status_id";');

        // Hủy bỏ chỉ mục idx_instructor
        await queryRunner.query('DROP INDEX "idx_instructor";');

        // Hủy bỏ chỉ mục idx_createUser
        await queryRunner.query('DROP INDEX "idx_createUser";');

        // Hủy bỏ chỉ mục idx_lastModifyUser
        await queryRunner.query('DROP INDEX "idx_lastModifyUser";');

        // Hủy bỏ chỉ mục idx_scientificResearchGroup
        await queryRunner.query('DROP INDEX "idx_scientificResearchGroup";');
    }

}
