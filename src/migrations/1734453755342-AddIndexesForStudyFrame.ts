import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIndexesForStudyFrame1734453755342 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Thêm chỉ mục cho cột facultyId trong bảng StudyFrame
        await queryRunner.query(`
            CREATE INDEX idx_studyFrame_faculty ON study_frame (facultyId);
        `);

        // Thêm chỉ mục cho cột cycleId trong bảng StudyFrame
        await queryRunner.query(`
            CREATE INDEX idx_studyFrame_cycle ON study_frame (cycleId);
        `);

        // Thêm chỉ mục cho cột majorId trong bảng StudyFrame_Component
        await queryRunner.query(`
            CREATE INDEX idx_studyFrameComponent_major ON studyFrame_component (majorId);
        `);

        // Thêm chỉ mục cho cột frameComponentId trong bảng StudyFrame_Component
        await queryRunner.query(`
            CREATE INDEX idx_studyFrameComponent_frameId ON studyFrame_component (frameComponentId);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Xóa chỉ mục khi rollback migration
        await queryRunner.query(`
            DROP INDEX idx_studyFrame_faculty;
        `);

        await queryRunner.query(`
            DROP INDEX idx_studyFrame_cycle;
        `);

        await queryRunner.query(`
            DROP INDEX idx_studyFrameComponent_major;
        `);

        // Xóa chỉ mục frameComponentId
        await queryRunner.query(`
            DROP INDEX idx_studyFrameComponent_frameId;
        `);
    }

}
