import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIndexesForSemesterCycle1734454611304 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Thêm chỉ mục cho cột semesterId trong bảng semester_cycle
        await queryRunner.query(`
            CREATE INDEX IDX_SEMESTER_CYCLE_SEMESTERID ON semester_cycle (semesterId);
        `);

        // Thêm chỉ mục cho cột cycleId trong bảng semester_cycle
        await queryRunner.query(`
            CREATE INDEX IDX_SEMESTER_CYCLE_CYCLEID ON semester_cycle (cycleId);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Xóa chỉ mục khi rollback migration
        await queryRunner.query(`
            DROP INDEX IDX_SEMESTER_CYCLE_SEMESTERID;
        `);

        await queryRunner.query(`
            DROP INDEX IDX_SEMESTER_CYCLE_CYCLEID;
        `);
    }
}
