import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexForSubjectSTFCompSemesters implements MigrationInterface {
    name = 'AddIndexForSubjectSTFCompSemesters';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Tạo chỉ mục cho subjectStudyFrameCompId trong bảng trung gian
        await queryRunner.query(`
      CREATE INDEX "IDX_SUBJECT_STUDYFRAMECOMP_SEMESTER_SUBJECTSTUDYFRAMECOMPID" 
      ON "subject_studyFrameComp_semester" ("subjectStudyFrameCompId");
    `);

        // Tạo chỉ mục cho semesterId trong bảng trung gian
        await queryRunner.query(`
      CREATE INDEX "IDX_SUBJECT_STUDYFRAMECOMP_SEMESTER_SEMESTERID" 
      ON "subject_studyFrameComp_semester" ("semesterId");
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Xóa các chỉ mục đã thêm
        await queryRunner.query(`
      DROP INDEX "IDX_SUBJECT_STUDYFRAMECOMP_SEMESTER_SUBJECTSTUDYFRAMECOMPID";
    `);

        await queryRunner.query(`
      DROP INDEX "IDX_SUBJECT_STUDYFRAMECOMP_SEMESTER_SEMESTERID";
    `);
    }
}
