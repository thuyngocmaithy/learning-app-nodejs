import { MigrationInterface, QueryRunner, TableIndex } from "typeorm";

export class AddIndexesForThesisUser1734453168579 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Tạo chỉ mục cho thesisId
        await queryRunner.createIndex('thesis_user', new TableIndex({
            name: 'idx_thesis_user_thesisId',
            columnNames: ['thesis'],
        }));

        // Tạo chỉ mục cho userId
        await queryRunner.createIndex('thesis_user', new TableIndex({
            name: 'idx_thesis_user_userId',
            columnNames: ['user'],
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Xóa chỉ mục cho thesisId
        await queryRunner.dropIndex('thesis_user', 'idx_thesis_user_thesisId');

        // Xóa chỉ mục cho userId
        await queryRunner.dropIndex('thesis_user', 'idx_thesis_user_userId');
    }
}
