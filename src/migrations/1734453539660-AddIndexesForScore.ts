import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIndexesForScore1734453539660 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Tạo chỉ mục cho cột subject và student trong bảng Score
        await queryRunner.query(`
            CREATE INDEX idx_score_subject_student ON score (subject, student);
        `);

        // Tạo chỉ mục cho cột scoreId trong bảng ComponentScore
        await queryRunner.query(`
            CREATE INDEX idx_component_score_score ON component_score (score);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Xóa chỉ mục khi rollback migration
        await queryRunner.query(`
            DROP INDEX idx_score_subject_student;
        `);

        await queryRunner.query(`
            DROP INDEX idx_component_score_score;
        `);
    }

}
