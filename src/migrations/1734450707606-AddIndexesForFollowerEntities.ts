import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIndexesForFollowerEntities1734450707606 implements MigrationInterface {
    name = 'AddIndexesForFollowerEntities1734450707606'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Thêm chỉ mục cho cột 'scientificResearchId' trong bảng 'Follower'
        await queryRunner.query(`CREATE INDEX "idx_follower_scientificResearch" ON "follower" ("scientificResearchId")`);

        // Thêm chỉ mục cho cột 'thesisId' trong bảng 'Follower'
        await queryRunner.query(`CREATE INDEX "idx_follower_thesis" ON "follower" ("thesisId")`);

        // Thêm chỉ mục cho cột 'followerId' trong bảng 'FollowerDetail'
        await queryRunner.query(`CREATE INDEX "idx_follower_followerDetails" ON "follower_detail" ("followerId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Xóa chỉ mục khi rollback migration
        await queryRunner.query(`DROP INDEX "idx_follower_scientificResearch" ON "follower"`);
        await queryRunner.query(`DROP INDEX "idx_follower_thesis" ON "follower"`);
        await queryRunner.query(`DROP INDEX "idx_follower_followerDetails" ON "follower_detail"`);
    }
}


