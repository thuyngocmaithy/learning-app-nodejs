import { MigrationInterface, QueryRunner, TableIndex } from "typeorm";

export class AddIndexesForThesis1734452939874 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Tạo chỉ mục cho cột statusId
        await queryRunner.createIndex('thesis', new TableIndex({
            name: 'idx_thesis_status_id',
            columnNames: ['statusId'],
        }));

        // Tạo chỉ mục cho cột createUserId
        await queryRunner.createIndex('thesis', new TableIndex({
            name: 'idx_thesis_create_user_id',
            columnNames: ['createUserId'],
        }));

        // Tạo chỉ mục cho cột instructorId
        await queryRunner.createIndex('thesis', new TableIndex({
            name: 'idx_thesis_instructor_id',
            columnNames: ['instructorId'],
        }));

        // Tạo chỉ mục cho cột lastModifyUserId
        await queryRunner.createIndex('thesis', new TableIndex({
            name: 'idx_thesis_last_modify_user_id',
            columnNames: ['lastModifyUserId'],
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Xóa chỉ mục cho cột statusId
        await queryRunner.dropIndex('thesis', 'idx_thesis_status_id');

        // Xóa chỉ mục cho cột createUserId
        await queryRunner.dropIndex('thesis', 'idx_thesis_create_user_id');

        // Xóa chỉ mục cho cột instructorId
        await queryRunner.dropIndex('thesis', 'idx_thesis_instructor_id');

        // Xóa chỉ mục cho cột lastModifyUserId
        await queryRunner.dropIndex('thesis', 'idx_thesis_last_modify_user_id');
    }
}
