// import { DataSource, In, Repository } from 'typeorm';
// import { Attach } from '../entities/Attach';
// import { ExpectedScore } from '../entities/ExpectedScore';
// // Import thêm các entity liên quan khác

// export class RelatedRecordsService {
//     private dataSource: DataSource;

//     constructor(dataSource: DataSource) {
//         this.dataSource = dataSource;
//     }

//     async countRelatedRecords(userId: string): Promise<number> {
//         const repositories = [
//             this.dataSource.getRepository(Attach),
//             this.dataSource.getRepository(ExpectedScore),
//             // Thêm các bảng liên quan khác vào đây
//         ];

//         let totalRelatedRecords = 0;

//         for (const repo of repositories) {
//             const count = await repo.count({ where: { userId } });
//             totalRelatedRecords += count;
//         }

//         return totalRelatedRecords;
//     }
// }
