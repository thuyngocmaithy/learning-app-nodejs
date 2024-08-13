/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

CREATE TABLE `academic_year` (
  `id` varchar(36) NOT NULL,
  `year` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_6b25452154cac9a0c98550c062` (`year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `account` (
  `id` varchar(36) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `refreshToken` varchar(255) DEFAULT NULL,
  `permissionId` varchar(25) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_41dfcb70af895ddf9a53094515` (`username`),
  UNIQUE KEY `IDX_4c8f96ccf523e9a3faefd5bdd4` (`email`),
  KEY `FK_620e1e5b7e59e234df73ace64d2` (`permissionId`),
  CONSTRAINT `FK_620e1e5b7e59e234df73ace64d2` FOREIGN KEY (`permissionId`) REFERENCES `permission` (`permissionId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `attach` (
  `id` varchar(36) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `link` varchar(255) NOT NULL,
  `createDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `lastModifyDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `internshipId` varchar(36) DEFAULT NULL,
  `projectId` varchar(25) DEFAULT NULL,
  `createUserId` varchar(36) NOT NULL,
  `lastModifyUserId` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_324f490bd4d87ae4dbbc8e6c359` (`internshipId`),
  KEY `FK_d03c78d5b8861ebe514450996fb` (`createUserId`),
  KEY `FK_b6dd174abbb5d902686c4a49acf` (`lastModifyUserId`),
  KEY `FK_2f933d032eeffa85a40523afdc5` (`projectId`),
  CONSTRAINT `FK_2f933d032eeffa85a40523afdc5` FOREIGN KEY (`projectId`) REFERENCES `project` (`projectId`),
  CONSTRAINT `FK_324f490bd4d87ae4dbbc8e6c359` FOREIGN KEY (`internshipId`) REFERENCES `internship` (`id`),
  CONSTRAINT `FK_b6dd174abbb5d902686c4a49acf` FOREIGN KEY (`lastModifyUserId`) REFERENCES `user` (`id`),
  CONSTRAINT `FK_d03c78d5b8861ebe514450996fb` FOREIGN KEY (`createUserId`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `component_score` (
  `id` varchar(36) NOT NULL,
  `componentName` varchar(255) NOT NULL,
  `weight` int NOT NULL,
  `weightScore` decimal(5,2) NOT NULL,
  `scoreId` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_288b37c17f6ee7d40b18a33f231` (`scoreId`),
  CONSTRAINT `FK_288b37c17f6ee7d40b18a33f231` FOREIGN KEY (`scoreId`) REFERENCES `score` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `faculty` (
  `facultyId` varchar(25) NOT NULL,
  `facultyName` varchar(255) NOT NULL,
  PRIMARY KEY (`facultyId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `feature` (
  `featureId` varchar(25) NOT NULL,
  `featureName` varchar(255) NOT NULL,
  `url` varchar(255) NOT NULL,
  `parentFeatureId` varchar(25) DEFAULT NULL,
  PRIMARY KEY (`featureId`),
  KEY `FK_106003759b25c6dba67e0456fbd` (`parentFeatureId`),
  CONSTRAINT `FK_106003759b25c6dba67e0456fbd` FOREIGN KEY (`parentFeatureId`) REFERENCES `feature` (`featureId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `follower` (
  `id` varchar(36) NOT NULL,
  `internshipId` varchar(36) DEFAULT NULL,
  `projectId` varchar(25) DEFAULT NULL,
  `thesisId` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_d732b17aabfb3ddf8cafd3b9a1b` (`internshipId`),
  KEY `FK_8a0dd3d0ee2c0a194b2de025101` (`projectId`),
  KEY `FK_a7f831ef260ad257b7ac4d47fb7` (`thesisId`),
  CONSTRAINT `FK_8a0dd3d0ee2c0a194b2de025101` FOREIGN KEY (`projectId`) REFERENCES `project` (`projectId`),
  CONSTRAINT `FK_a7f831ef260ad257b7ac4d47fb7` FOREIGN KEY (`thesisId`) REFERENCES `thesis` (`id`),
  CONSTRAINT `FK_d732b17aabfb3ddf8cafd3b9a1b` FOREIGN KEY (`internshipId`) REFERENCES `internship` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `follower_detail` (
  `id` varchar(36) NOT NULL,
  `followerId` varchar(36) NOT NULL,
  `userId` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_71036233f8c57d117aa7874e4ee` (`followerId`),
  KEY `FK_1464a425f2627a21874a4fdad03` (`userId`),
  CONSTRAINT `FK_1464a425f2627a21874a4fdad03` FOREIGN KEY (`userId`) REFERENCES `user` (`id`),
  CONSTRAINT `FK_71036233f8c57d117aa7874e4ee` FOREIGN KEY (`followerId`) REFERENCES `follower` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `internship` (
  `id` varchar(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL,
  `salary` decimal(10,2) NOT NULL,
  `internNumber` int NOT NULL,
  `type` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `require` varchar(255) NOT NULL,
  `benefit` varchar(255) DEFAULT NULL,
  `createDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `lastModifyDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `createUserId` varchar(36) NOT NULL,
  `lastModifyUserId` varchar(36) DEFAULT NULL,
  `facultyFacultyId` varchar(25) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_9b8432bf18ec9e5d79e44b410d4` (`createUserId`),
  KEY `FK_42df28b60930f1a11a8af73d5a0` (`lastModifyUserId`),
  KEY `FK_390563ab1497036842e1953af5a` (`facultyFacultyId`),
  CONSTRAINT `FK_390563ab1497036842e1953af5a` FOREIGN KEY (`facultyFacultyId`) REFERENCES `faculty` (`facultyId`),
  CONSTRAINT `FK_42df28b60930f1a11a8af73d5a0` FOREIGN KEY (`lastModifyUserId`) REFERENCES `user` (`id`),
  CONSTRAINT `FK_9b8432bf18ec9e5d79e44b410d4` FOREIGN KEY (`createUserId`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `internship_faculty` (
  `id` varchar(36) NOT NULL,
  `internshipId` varchar(36) NOT NULL,
  `facultyFacultyId` varchar(25) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_4bffccceb9bf27ac5262c6f6683` (`internshipId`),
  KEY `FK_b83e0cbe7baae02a733bae2a25f` (`facultyFacultyId`),
  CONSTRAINT `FK_4bffccceb9bf27ac5262c6f6683` FOREIGN KEY (`internshipId`) REFERENCES `internship` (`id`),
  CONSTRAINT `FK_b83e0cbe7baae02a733bae2a25f` FOREIGN KEY (`facultyFacultyId`) REFERENCES `faculty` (`facultyId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `internship_user` (
  `id` varchar(36) NOT NULL,
  `isApprove` tinyint NOT NULL DEFAULT '0',
  `internshipId` varchar(36) NOT NULL,
  `userId` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_33e6a6df0fca08e0deec6af4f30` (`internshipId`),
  KEY `FK_e621657a598fcf5806220dfec18` (`userId`),
  CONSTRAINT `FK_33e6a6df0fca08e0deec6af4f30` FOREIGN KEY (`internshipId`) REFERENCES `internship` (`id`),
  CONSTRAINT `FK_e621657a598fcf5806220dfec18` FOREIGN KEY (`userId`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `major` (
  `majorId` varchar(25) NOT NULL,
  `majorName` varchar(255) NOT NULL,
  `orderNo` int NOT NULL,
  `facultyId` varchar(25) DEFAULT NULL,
  PRIMARY KEY (`majorId`),
  KEY `FK_ac4bdd43e2f613aca140c937fbe` (`facultyId`),
  CONSTRAINT `FK_ac4bdd43e2f613aca140c937fbe` FOREIGN KEY (`facultyId`) REFERENCES `faculty` (`facultyId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `notification` (
  `id` varchar(36) NOT NULL,
  `type` varchar(255) NOT NULL,
  `content` varchar(255) NOT NULL,
  `url` varchar(255) NOT NULL,
  `isRead` tinyint NOT NULL DEFAULT '0',
  `createDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `toUserId` varchar(36) DEFAULT NULL,
  `createUserId` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_9cad92f9fea8341a1115e6d288e` (`createUserId`),
  KEY `FK_af00ff08918ea1e83aa3db736be` (`toUserId`),
  CONSTRAINT `FK_9cad92f9fea8341a1115e6d288e` FOREIGN KEY (`createUserId`) REFERENCES `user` (`id`),
  CONSTRAINT `FK_af00ff08918ea1e83aa3db736be` FOREIGN KEY (`toUserId`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `permission` (
  `permissionId` varchar(25) NOT NULL,
  `permissionName` varchar(255) NOT NULL,
  `createDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `lastModifyDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `lastModifyUserId` varchar(36) DEFAULT NULL,
  `createUserId` varchar(36) NOT NULL,
  PRIMARY KEY (`permissionId`),
  KEY `FK_92b78fb3c97fd84064b88b4b1fe` (`lastModifyUserId`),
  KEY `FK_fff5202c3478ac5a9a5bc54d888` (`createUserId`),
  CONSTRAINT `FK_92b78fb3c97fd84064b88b4b1fe` FOREIGN KEY (`lastModifyUserId`) REFERENCES `user` (`id`),
  CONSTRAINT `FK_fff5202c3478ac5a9a5bc54d888` FOREIGN KEY (`createUserId`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `permission_feature` (
  `id` varchar(36) NOT NULL,
  `orderNo` int NOT NULL,
  `permissionPermissionId` varchar(25) NOT NULL,
  `featureFeatureId` varchar(25) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_0c68fdd75f193a16aecd5e3740a` (`permissionPermissionId`),
  KEY `FK_e64f7cde233f9b9771446972591` (`featureFeatureId`),
  CONSTRAINT `FK_0c68fdd75f193a16aecd5e3740a` FOREIGN KEY (`permissionPermissionId`) REFERENCES `permission` (`permissionId`),
  CONSTRAINT `FK_e64f7cde233f9b9771446972591` FOREIGN KEY (`featureFeatureId`) REFERENCES `feature` (`featureId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `project` (
  `projectId` varchar(25) NOT NULL,
  `projectName` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `numberOfMember` int NOT NULL,
  `numberOfRegister` int NOT NULL,
  `startDate` datetime NOT NULL,
  `finishDate` datetime NOT NULL,
  `completionTime` datetime NOT NULL,
  `createDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `lastModifyDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `statusStatusId` varchar(25) NOT NULL,
  `instructorId` varchar(36) NOT NULL,
  `createUserId` varchar(36) NOT NULL,
  `lastModifyUserId` varchar(36) NOT NULL,
  `facultyFacultyId` varchar(25) NOT NULL,
  PRIMARY KEY (`projectId`),
  KEY `FK_7d17ba5929d836acd6b024c59ec` (`statusStatusId`),
  KEY `FK_87e97fd8b07351fb1bbaa991337` (`instructorId`),
  KEY `FK_4209771a8cf1967c2f4aba4e44e` (`createUserId`),
  KEY `FK_c47317ff4aedb811580b0c308fa` (`lastModifyUserId`),
  KEY `FK_4e46159a491837f208d7d648f52` (`facultyFacultyId`),
  CONSTRAINT `FK_4209771a8cf1967c2f4aba4e44e` FOREIGN KEY (`createUserId`) REFERENCES `user` (`id`),
  CONSTRAINT `FK_4e46159a491837f208d7d648f52` FOREIGN KEY (`facultyFacultyId`) REFERENCES `faculty` (`facultyId`),
  CONSTRAINT `FK_7d17ba5929d836acd6b024c59ec` FOREIGN KEY (`statusStatusId`) REFERENCES `status` (`statusId`),
  CONSTRAINT `FK_87e97fd8b07351fb1bbaa991337` FOREIGN KEY (`instructorId`) REFERENCES `user` (`id`),
  CONSTRAINT `FK_c47317ff4aedb811580b0c308fa` FOREIGN KEY (`lastModifyUserId`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `project_faculty` (
  `id` varchar(36) NOT NULL,
  `projectProjectId` varchar(25) NOT NULL,
  `facultyFacultyId` varchar(25) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_8318533ca8c4dc552366939b676` (`projectProjectId`),
  KEY `FK_bb0d302e67713f0463a310e9e5b` (`facultyFacultyId`),
  CONSTRAINT `FK_8318533ca8c4dc552366939b676` FOREIGN KEY (`projectProjectId`) REFERENCES `project` (`projectId`),
  CONSTRAINT `FK_bb0d302e67713f0463a310e9e5b` FOREIGN KEY (`facultyFacultyId`) REFERENCES `faculty` (`facultyId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `project_user` (
  `id` varchar(36) NOT NULL,
  `isApprove` tinyint NOT NULL DEFAULT '0',
  `projectProjectId` varchar(25) NOT NULL,
  `userId` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_37822b425128986d85cfb4681c3` (`projectProjectId`),
  KEY `FK_8d75193a81f827ba8d58575e637` (`userId`),
  CONSTRAINT `FK_37822b425128986d85cfb4681c3` FOREIGN KEY (`projectProjectId`) REFERENCES `project` (`projectId`),
  CONSTRAINT `FK_8d75193a81f827ba8d58575e637` FOREIGN KEY (`userId`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `score` (
  `id` varchar(36) NOT NULL,
  `examScore` decimal(5,2) NOT NULL,
  `testScore` decimal(5,2) NOT NULL,
  `finalScore10` decimal(5,2) NOT NULL,
  `finalScore4` decimal(5,2) NOT NULL,
  `finalScoreLetter` varchar(255) NOT NULL,
  `result` tinyint NOT NULL DEFAULT '0',
  `studentId` varchar(36) NOT NULL,
  `subjectId` varchar(25) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_c4f50c0b1826dbb9140b122225b` (`studentId`),
  KEY `FK_7b79ad7cb92c537750b37fa2b80` (`subjectId`),
  CONSTRAINT `FK_7b79ad7cb92c537750b37fa2b80` FOREIGN KEY (`subjectId`) REFERENCES `subject` (`subjectId`),
  CONSTRAINT `FK_c4f50c0b1826dbb9140b122225b` FOREIGN KEY (`studentId`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `semester` (
  `id` varchar(36) NOT NULL,
  `semesterName` int NOT NULL,
  `academicYearId` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_f849a4d256358d21fbd02cfec38` (`academicYearId`),
  CONSTRAINT `FK_f849a4d256358d21fbd02cfec38` FOREIGN KEY (`academicYearId`) REFERENCES `academic_year` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `status` (
  `statusId` varchar(25) NOT NULL,
  `statusName` varchar(255) NOT NULL,
  `type` enum('Tiến độ dự án nghiên cứu','Tiến độ khóa luận','Tiến độ thực tập') NOT NULL,
  `orderNo` int NOT NULL,
  `createDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `lastModifyDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `createUserId` varchar(36) NOT NULL,
  `lastModifyUserId` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`statusId`),
  KEY `FK_05b0993644de94cace31da9a375` (`createUserId`),
  KEY `FK_0d8bedd11892d58ccb7025f65d6` (`lastModifyUserId`),
  CONSTRAINT `FK_05b0993644de94cace31da9a375` FOREIGN KEY (`createUserId`) REFERENCES `user` (`id`),
  CONSTRAINT `FK_0d8bedd11892d58ccb7025f65d6` FOREIGN KEY (`lastModifyUserId`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `study_frame` (
  `id` varchar(36) NOT NULL,
  `frameName` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `parentFrameId` varchar(36) DEFAULT NULL,
  `frameId` varchar(255) NOT NULL,
  `creditHour` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_5ce806b2dfaea24134972b9aca` (`frameId`),
  KEY `FK_acf9124d5141d828e0d453962fa` (`parentFrameId`),
  CONSTRAINT `FK_acf9124d5141d828e0d453962fa` FOREIGN KEY (`parentFrameId`) REFERENCES `study_frame` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `subject` (
  `subjectId` varchar(25) NOT NULL,
  `subjectName` varchar(255) NOT NULL,
  `creditHour` int NOT NULL,
  `isCompulsory` tinyint NOT NULL,
  `createDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `lastModifyDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `majorId` varchar(25) DEFAULT NULL,
  `frameId` varchar(36) DEFAULT NULL,
  `createUserId` varchar(36) NOT NULL,
  `lastModifyUserId` varchar(36) NOT NULL,
  `subjectBeforeId` varchar(25) DEFAULT NULL,
  `subjectEqualId` varchar(25) DEFAULT NULL,
  `listMajor` varchar(255) NOT NULL,
  PRIMARY KEY (`subjectId`),
  KEY `FK_2bd1d2d8cefce6b7122c5ed45b6` (`frameId`),
  KEY `FK_18e6f5676b94650c9e321f43ecf` (`createUserId`),
  KEY `FK_3614cc2b4ba3a59c2ac6c527f18` (`lastModifyUserId`),
  KEY `FK_5a65660f60b8bce51a3101af9fa` (`majorId`),
  KEY `FK_416ebbbeb40bb17eb8298bb16b3` (`subjectBeforeId`),
  KEY `FK_2233a5b6041532ba1e3c7ddb1f9` (`subjectEqualId`),
  CONSTRAINT `FK_18e6f5676b94650c9e321f43ecf` FOREIGN KEY (`createUserId`) REFERENCES `user` (`id`),
  CONSTRAINT `FK_2233a5b6041532ba1e3c7ddb1f9` FOREIGN KEY (`subjectEqualId`) REFERENCES `subject` (`subjectId`),
  CONSTRAINT `FK_2bd1d2d8cefce6b7122c5ed45b6` FOREIGN KEY (`frameId`) REFERENCES `study_frame` (`id`),
  CONSTRAINT `FK_3614cc2b4ba3a59c2ac6c527f18` FOREIGN KEY (`lastModifyUserId`) REFERENCES `user` (`id`),
  CONSTRAINT `FK_416ebbbeb40bb17eb8298bb16b3` FOREIGN KEY (`subjectBeforeId`) REFERENCES `subject` (`subjectId`),
  CONSTRAINT `FK_5a65660f60b8bce51a3101af9fa` FOREIGN KEY (`majorId`) REFERENCES `major` (`majorId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `subject_semester` (
  `id` varchar(36) NOT NULL,
  `subjectId` varchar(25) NOT NULL,
  `semesterId` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_bc05fe15031fd27534a9cf8d8aa` (`semesterId`),
  KEY `FK_ab547ecc3f2d9c13aa2f418a90d` (`subjectId`),
  CONSTRAINT `FK_ab547ecc3f2d9c13aa2f418a90d` FOREIGN KEY (`subjectId`) REFERENCES `subject` (`subjectId`),
  CONSTRAINT `FK_bc05fe15031fd27534a9cf8d8aa` FOREIGN KEY (`semesterId`) REFERENCES `semester` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `thesis` (
  `id` varchar(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `startDate` datetime NOT NULL,
  `endDate` datetime NOT NULL,
  `createDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `lastModifyDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `supervisorId` varchar(36) NOT NULL,
  `facultyFacultyId` varchar(25) NOT NULL,
  `statusStatusId` varchar(25) NOT NULL,
  `createUserId` varchar(36) NOT NULL,
  `lastModifyUserId` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_5e56284466dd1b21202bacc5bf7` (`supervisorId`),
  KEY `FK_67e371d266a007d7154585aae3e` (`facultyFacultyId`),
  KEY `FK_d7b6cb1d31265a6d8b79cde66d3` (`statusStatusId`),
  KEY `FK_eb0514273f5828c2442f6969765` (`createUserId`),
  KEY `FK_adba45dee345fb523e21f7979ff` (`lastModifyUserId`),
  CONSTRAINT `FK_5e56284466dd1b21202bacc5bf7` FOREIGN KEY (`supervisorId`) REFERENCES `user` (`id`),
  CONSTRAINT `FK_67e371d266a007d7154585aae3e` FOREIGN KEY (`facultyFacultyId`) REFERENCES `faculty` (`facultyId`),
  CONSTRAINT `FK_adba45dee345fb523e21f7979ff` FOREIGN KEY (`lastModifyUserId`) REFERENCES `user` (`id`),
  CONSTRAINT `FK_d7b6cb1d31265a6d8b79cde66d3` FOREIGN KEY (`statusStatusId`) REFERENCES `status` (`statusId`),
  CONSTRAINT `FK_eb0514273f5828c2442f6969765` FOREIGN KEY (`createUserId`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `thesis_user` (
  `id` varchar(36) NOT NULL,
  `isApprove` tinyint NOT NULL DEFAULT '0',
  `thesisId` varchar(36) NOT NULL,
  `userId` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_6ab848930f5f542f57f97cb9d77` (`thesisId`),
  KEY `FK_1254db3e18b6e9137cdcd48336b` (`userId`),
  CONSTRAINT `FK_1254db3e18b6e9137cdcd48336b` FOREIGN KEY (`userId`) REFERENCES `user` (`id`),
  CONSTRAINT `FK_6ab848930f5f542f57f97cb9d77` FOREIGN KEY (`thesisId`) REFERENCES `thesis` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `user` (
  `id` varchar(36) NOT NULL,
  `userId` varchar(255) NOT NULL,
  `fullname` varchar(255) NOT NULL,
  `dateOfBirth` datetime NOT NULL,
  `placeOfBirth` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `isStudent` tinyint NOT NULL DEFAULT '1',
  `class` varchar(255) DEFAULT NULL,
  `stillStudy` tinyint DEFAULT NULL,
  `firstAcademicYear` int DEFAULT NULL,
  `lastAcademicYear` int DEFAULT NULL,
  `isActive` tinyint NOT NULL DEFAULT '0',
  `createDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `lastModifyDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `accountId` varchar(36) NOT NULL,
  `createUserId` varchar(36) DEFAULT NULL,
  `lastModifyUserId` varchar(36) DEFAULT NULL,
  `facultyId` varchar(25) DEFAULT NULL,
  `majorId` varchar(25) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_d72ea127f30e21753c9e229891` (`userId`),
  KEY `FK_68d3c22dbd95449360fdbf7a3f1` (`accountId`),
  KEY `FK_848c0779e2423d52fd964bbb793` (`facultyId`),
  KEY `FK_6d529e7f25a03e0e903a314967f` (`majorId`),
  KEY `FK_a4cde10a17f5669f01dc6d0e1f5` (`createUserId`),
  KEY `FK_70212d123eef058b66011e1a337` (`lastModifyUserId`),
  CONSTRAINT `FK_68d3c22dbd95449360fdbf7a3f1` FOREIGN KEY (`accountId`) REFERENCES `account` (`id`),
  CONSTRAINT `FK_6d529e7f25a03e0e903a314967f` FOREIGN KEY (`majorId`) REFERENCES `major` (`majorId`),
  CONSTRAINT `FK_70212d123eef058b66011e1a337` FOREIGN KEY (`lastModifyUserId`) REFERENCES `user` (`id`),
  CONSTRAINT `FK_848c0779e2423d52fd964bbb793` FOREIGN KEY (`facultyId`) REFERENCES `faculty` (`facultyId`),
  CONSTRAINT `FK_a4cde10a17f5669f01dc6d0e1f5` FOREIGN KEY (`createUserId`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `academic_year` (`id`, `year`) VALUES
('0', '0000-0000');
INSERT INTO `academic_year` (`id`, `year`) VALUES
('1', '2020-2021');
INSERT INTO `academic_year` (`id`, `year`) VALUES
('2', '2021-2022');
INSERT INTO `academic_year` (`id`, `year`) VALUES
('3', '2022-2023'),
('4', '2023-2024'),
('5', '2024-2025'),
('6', '2025-2026'),
('7', '2026-2027');

INSERT INTO `account` (`id`, `username`, `password`, `email`, `refreshToken`, `permissionId`) VALUES
('032646b8-5249-11ef-89f2-1aa268f50191', 'admin', '123qwe', 'admin@gmail.com', '', NULL);
INSERT INTO `account` (`id`, `username`, `password`, `email`, `refreshToken`, `permissionId`) VALUES
('03266b97-5249-11ef-89f2-1aa268f50191', '3120410003', '123qwe', 'lethanhhai586@gmail.com', '', NULL);
INSERT INTO `account` (`id`, `username`, `password`, `email`, `refreshToken`, `permissionId`) VALUES
('0326c478-5249-11ef-89f2-1aa268f50191', '3120410512', '123qwe', 'thuyngocmaithyy@gmail.com', '', NULL);
INSERT INTO `account` (`id`, `username`, `password`, `email`, `refreshToken`, `permissionId`) VALUES
('0326ccb9-5249-11ef-89f2-1aa268f50191', '3120410002', '123qwe', 'vohaiha@gmail.com', '', NULL),
('3abfe00f-5475-11ef-929d-1aa268f50191', '3120410115', '123qwe', 'dayly03120@gmail.com', '', NULL),
('4b4c5532-5475-11ef-929d-1aa268f50191', '3120410103', '123qwe', 'nguyenhaiduong9102@gmail.com', '', NULL);





INSERT INTO `faculty` (`facultyId`, `facultyName`) VALUES
('admin', 'admin');
INSERT INTO `faculty` (`facultyId`, `facultyName`) VALUES
('DAN', 'Ngôn ngữ Anh');
INSERT INTO `faculty` (`facultyId`, `facultyName`) VALUES
('DCM', 'Công nghệ Kĩ thuật Môi trường');
INSERT INTO `faculty` (`facultyId`, `facultyName`) VALUES
('DCT', 'Công Nghệ Thông Tin'),
('DCV', 'Công nghệ KT điện tử – viễn thông'),
('DDE', 'Kĩ thuật Điện'),
('DDI', 'SP Địa Lý'),
('DDV', 'Kĩ thuật Điện tử – viễn thông'),
('DGD', 'Giáo dục Chính trị'),
('DGM', 'Giáo Dục Mầm Non'),
('DGT', 'Giáo Dục Tiểu Học'),
('DHO', 'SP Hóa'),
('DKD', 'Công nghệ Kĩ thuật điện, điện tử'),
('DKE', 'Kế toán'),
('DKH', 'Sư phạm Khoa học tự nhiên'),
('DKM', 'Khoa học môi trường'),
('DKP', 'Kỹ Thuật Phần Mềm'),
('DKQ', 'Kinh doanh quốc tế'),
('DKV', 'Khoa học Thư viện'),
('DLD', 'Sư phạm Lịch sử – Địa lý'),
('DLI', 'SP Vật lí'),
('DLU', 'Luât'),
('DMI', 'SP Mỹ thuật'),
('DNA', 'Thanh Nhạc'),
('DNH', 'SP Âm nhạc'),
('DQG', 'Quản lý Giáo dục'),
('DQK', 'Quản trị kinh doanh'),
('DQT', 'Quốc tế học'),
('DQV', 'Quản trị văn phòng'),
('DSA', 'SP Tiếng Anh'),
('DSI', 'SP Sinh'),
('DSU', 'SP Lịch Sử'),
('DTL', 'Tâm lí học'),
('DTN', 'Tài chính – Ngân hàng'),
('DTO', 'SP Toán'),
('DTT', 'Thông tin – Thư viện'),
('DTU', 'Toán Ứng Dụng'),
('DVA', 'SP Ngữ Văn'),
('DVI', 'Việt Nam học');

INSERT INTO `feature` (`featureId`, `featureName`, `url`, `parentFeatureId`) VALUES
('001', 'Sắp xếp kế hoạch', '/sapxepkehoach', NULL);
INSERT INTO `feature` (`featureId`, `featureName`, `url`, `parentFeatureId`) VALUES
('002', 'Xem điểm', '/xemdiem', NULL);
INSERT INTO `feature` (`featureId`, `featureName`, `url`, `parentFeatureId`) VALUES
('003', 'Theo Dõi Tiến Độ', '/theodoitiendo', NULL);
INSERT INTO `feature` (`featureId`, `featureName`, `url`, `parentFeatureId`) VALUES
('004', 'Thông báo', '/thongbao', NULL),
('005', 'Tham Gia Dự Án', '/thamgiaduan', NULL),
('006', 'Đăng Ký Khoá Luận', '/dangkykhoaluan', NULL),
('007', 'Đăng Ký Thực Tập', '/dangkythuctap', NULL),
('008', 'Tư Vấn Trực Tuyến', '/tuvantructuyen', NULL),
('009', 'Lưu Trữ Khung Đào Tạo', '/lưutrudaotao', NULL),
('010', 'Cập Nhật Môn Học', '/capnhatmonhoc', NULL),
('011', 'Khoá Luận Tốt Nghiệp', '/khoaluantotnghiep', NULL),
('012', 'Thực Tập Tốt Nghiệp', '/thuctaptotnghiep', NULL),
('013', 'Cập Nhật Tiến Độ', '/capnhattiendo', NULL),
('014', 'Tư Vấn Trực Tuyến', '/tuvantructuyen', NULL),
('015', 'Chọn môn học dự kiến', '/sapxepkehoach/chonmonhoc', NULL),
('016', 'Chọn thời gian thực tập', '/sapxepkehoach/chonmonhoc', NULL),
('017', 'Chọn thời gian làm khóa luận ', '/sapxepkehoach/chonmonhoc', NULL),
('018', 'Các môn đã học', '/sapxepkehoach/chonmonhoc', NULL),
('019', 'Số tín chỉ đã hoàn thành', '/sapxepkehoach/chonmonhoc', NULL),
('020', 'Tiến độ thực hiện thực tập', '/sapxepkehoach/chonmonhoc', NULL),
('021', 'Tiến độ thực hiện khoá luận', '/sapxepkehoach/chonmonhoc', NULL),
('022', 'Tiến độ thực hiện dự án', '/sapxepkehoach/chonmonhoc', NULL),
('023', 'Tiến độ nộp chuẩn đầu ra', '/sapxepkehoach/chonmonhoc', NULL);











INSERT INTO `major` (`majorId`, `majorName`, `orderNo`, `facultyId`) VALUES
('HTTT', 'Hệ Thống Thông Tin', 1, NULL);
INSERT INTO `major` (`majorId`, `majorName`, `orderNo`, `facultyId`) VALUES
('KHMT', 'Khoa Học Máy Tính', 3, NULL);
INSERT INTO `major` (`majorId`, `majorName`, `orderNo`, `facultyId`) VALUES
('KTMT', 'Kỹ Thuật Máy Tính', 2, NULL);
INSERT INTO `major` (`majorId`, `majorName`, `orderNo`, `facultyId`) VALUES
('KTPM', 'Kỹ Thuật Phần Mềm', 4, NULL);



INSERT INTO `permission` (`permissionId`, `permissionName`, `createDate`, `lastModifyDate`, `lastModifyUserId`, `createUserId`) VALUES
('admin', 'admin', '2024-08-08 01:43:13.345630', '2024-08-08 02:29:13.197432', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191');
INSERT INTO `permission` (`permissionId`, `permissionName`, `createDate`, `lastModifyDate`, `lastModifyUserId`, `createUserId`) VALUES
('faculty', 'faculty', '2024-08-08 01:43:13.345630', '2024-08-08 02:29:36.481187', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191');
INSERT INTO `permission` (`permissionId`, `permissionName`, `createDate`, `lastModifyDate`, `lastModifyUserId`, `createUserId`) VALUES
('student', 'student', '2024-08-08 01:43:13.345630', '2024-08-08 02:29:36.788037', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191');











INSERT INTO `semester` (`id`, `semesterName`, `academicYearId`) VALUES
('69c18939-579b-11ef-aca7-1aa268f50191', 0, '0');
INSERT INTO `semester` (`id`, `semesterName`, `academicYearId`) VALUES
('69c5bac6-579b-11ef-aca7-1aa268f50191', 1, '1');
INSERT INTO `semester` (`id`, `semesterName`, `academicYearId`) VALUES
('69c7b632-579b-11ef-aca7-1aa268f50191', 2, '1');
INSERT INTO `semester` (`id`, `semesterName`, `academicYearId`) VALUES
('69c9b5c8-579b-11ef-aca7-1aa268f50191', 3, '1'),
('69c9becc-579b-11ef-aca7-1aa268f50191', 1, '2'),
('69c9c321-579b-11ef-aca7-1aa268f50191', 2, '2'),
('69c9c743-579b-11ef-aca7-1aa268f50191', 3, '2'),
('69c9c949-579b-11ef-aca7-1aa268f50191', 1, '3'),
('69c9cc5d-579b-11ef-aca7-1aa268f50191', 2, '3'),
('69c9ce49-579b-11ef-aca7-1aa268f50191', 3, '3'),
('69c9cffb-579b-11ef-aca7-1aa268f50191', 1, '4'),
('69c9d1ac-579b-11ef-aca7-1aa268f50191', 2, '4'),
('69c9d32d-579b-11ef-aca7-1aa268f50191', 3, '4'),
('69c9d493-579b-11ef-aca7-1aa268f50191', 1, '5'),
('69c9d619-579b-11ef-aca7-1aa268f50191', 2, '5'),
('69c9d751-579b-11ef-aca7-1aa268f50191', 3, '5'),
('69c9d826-579b-11ef-aca7-1aa268f50191', 1, '6'),
('69c9ddc0-579b-11ef-aca7-1aa268f50191', 2, '6'),
('69c9df8e-579b-11ef-aca7-1aa268f50191', 3, '6'),
('69c9e113-579b-11ef-aca7-1aa268f50191', 1, '7');



INSERT INTO `study_frame` (`id`, `frameName`, `description`, `parentFrameId`, `frameId`, `creditHour`) VALUES
('e3f05651-57e4-11ef-8c50-1aa268f50191', 'Chuyên ngành Hệ thống thông tin', 'Chuyên ngành Hệ thống thông tin', 'e9a2184d-579b-11ef-aca7-1aa268f50191', 'CN_HTTT', '34/46');
INSERT INTO `study_frame` (`id`, `frameName`, `description`, `parentFrameId`, `frameId`, `creditHour`) VALUES
('e3f0b308-57e4-11ef-8c50-1aa268f50191', 'Chuyên ngành Kỹ thuật máy tính', 'Chuyên ngành Kỹ thuật máy tính', 'e9a2184d-579b-11ef-aca7-1aa268f50191', 'CN_KTMT', '34/46');
INSERT INTO `study_frame` (`id`, `frameName`, `description`, `parentFrameId`, `frameId`, `creditHour`) VALUES
('e3f104f7-57e4-11ef-8c50-1aa268f50191', 'Chuyên ngành Khoa học máy tính', 'Chuyên ngành Khoa học máy tính', 'e9a2184d-579b-11ef-aca7-1aa268f50191', 'CN_KHMT', '34/52');
INSERT INTO `study_frame` (`id`, `frameName`, `description`, `parentFrameId`, `frameId`, `creditHour`) VALUES
('e3f10db3-57e4-11ef-8c50-1aa268f50191', 'Chuyên ngành Kỹ thuật phần mềm', 'Chuyên ngành Kỹ thuật phần mềm', 'e9a2184d-579b-11ef-aca7-1aa268f50191', 'CN_KTPM', '34/49'),
('e3f1120a-57e4-11ef-8c50-1aa268f50191', 'Các học phần bắt buộc', 'Các học phần bắt buộc Hệ thống thông tin', 'e3f05651-57e4-11ef-8c50-1aa268f50191', 'CN_HTTT_BB', '16/16'),
('e3f11451-57e4-11ef-8c50-1aa268f50191', 'Các học phần tự chọn', 'Các học phần tự chọn Hệ thống thông tin', 'e3f05651-57e4-11ef-8c50-1aa268f50191', 'CN_HTTT_TC', '18/30'),
('e3f11669-57e4-11ef-8c50-1aa268f50191', 'Các học phần bắt buộc', 'Các học phần bắt buộc Kỹ thuật máy tính', 'e3f0b308-57e4-11ef-8c50-1aa268f50191', 'CN_KTMT_BB', '16/16'),
('e3f119e6-57e4-11ef-8c50-1aa268f50191', 'Các học phần tự chọn', 'Các học phần tự chọn Kỹ thuật máy tính', 'e3f0b308-57e4-11ef-8c50-1aa268f50191', 'CN_KTMT_TC', '18/30'),
('e3f167c2-57e4-11ef-8c50-1aa268f50191', 'Các học phần bắt buộc', 'Các học phần bắt buộc Khoa học máy tính', 'e3f104f7-57e4-11ef-8c50-1aa268f50191', 'CN_KHMT_BB', '16/16'),
('e3f16aeb-57e4-11ef-8c50-1aa268f50191', 'Các học phần tự chọn', 'Các học phần tự chọn Khoa học máy tính', 'e3f104f7-57e4-11ef-8c50-1aa268f50191', 'CN_KHMT_TC', '18/30'),
('e3f1700e-57e4-11ef-8c50-1aa268f50191', 'Các học phần bắt buộc', 'Các học phần bắt buộc Kỹ thuật phần mềm', 'e3f10db3-57e4-11ef-8c50-1aa268f50191', 'CN_KTPM_BB', '16/16'),
('e3f173c9-57e4-11ef-8c50-1aa268f50191', 'Các học phần tự chọn', 'Các học phần tự chọn Kỹ thuật phần mềm', 'e3f10db3-57e4-11ef-8c50-1aa268f50191', 'CN_KTPM_TC', '18/30'),
('e99e7204-579b-11ef-aca7-1aa268f50191', 'Khối kiến thức giáo dục đại cương\r\nkhông tính GDTC và GDQPAN\r\n', 'Kiến thức đại cương', NULL, 'GDDC', ''),
('e9a1e9de-579b-11ef-aca7-1aa268f50191', 'Kiến thức cơ sở ngành', 'Kiến thức cơ sở ngành', 'e9a2192b-579b-11ef-aca7-1aa268f50191', 'CSN', '48/48'),
('e9a216da-579b-11ef-aca7-1aa268f50191', 'Kiến thức ngành', 'Kiến thức ngành', 'e9a2192b-579b-11ef-aca7-1aa268f50191', 'NGANH', '48/68'),
('e9a2184d-579b-11ef-aca7-1aa268f50191', 'Kiến thức chuyên ngành', 'Kiến thức chuyên ngành', 'e9a2192b-579b-11ef-aca7-1aa268f50191', 'CHUYENNGANH', ''),
('e9a2192b-579b-11ef-aca7-1aa268f50191', 'Khối kiến thức chuyên nghiệp', 'Khối kiến thức chuyên nghiệp', NULL, 'CHUYENNGHIEP', '');

INSERT INTO `subject` (`subjectId`, `subjectName`, `creditHour`, `isCompulsory`, `createDate`, `lastModifyDate`, `majorId`, `frameId`, `createUserId`, `lastModifyUserId`, `subjectBeforeId`, `subjectEqualId`, `listMajor`) VALUES
('841020', 'Cơ sở lập trình', 3, 1, '2024-08-06 00:00:00.000000', '2024-08-11 13:27:25.035086', NULL, 'e9a1e9de-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, '');
INSERT INTO `subject` (`subjectId`, `subjectName`, `creditHour`, `isCompulsory`, `createDate`, `lastModifyDate`, `majorId`, `frameId`, `createUserId`, `lastModifyUserId`, `subjectBeforeId`, `subjectEqualId`, `listMajor`) VALUES
('841021', 'Kiến trúc máy tính', 3, 1, '2024-08-06 00:00:00.000000', '2024-08-11 13:27:25.042028', NULL, 'e9a1e9de-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, '');
INSERT INTO `subject` (`subjectId`, `subjectName`, `creditHour`, `isCompulsory`, `createDate`, `lastModifyDate`, `majorId`, `frameId`, `createUserId`, `lastModifyUserId`, `subjectBeforeId`, `subjectEqualId`, `listMajor`) VALUES
('841022', 'Hệ điều hành', 3, 1, '2024-08-06 00:00:00.000000', '2024-08-11 13:27:25.048977', NULL, 'e9a1e9de-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, '');
INSERT INTO `subject` (`subjectId`, `subjectName`, `creditHour`, `isCompulsory`, `createDate`, `lastModifyDate`, `majorId`, `frameId`, `createUserId`, `lastModifyUserId`, `subjectBeforeId`, `subjectEqualId`, `listMajor`) VALUES
('841044', 'Phương pháp lập trình hướng đối tượng', 4, 1, '2024-08-06 00:00:00.000000', '2024-08-11 13:27:25.082991', NULL, 'e9a1e9de-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841047', 'Công nghệ phần mềm', 4, 1, '2024-08-06 00:00:00.000000', '2024-08-11 13:32:06.804127', NULL, 'e9a216da-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841048', 'Phân tích thiết kế HTTT', 4, 1, '2024-08-06 00:00:00.000000', '2024-08-11 13:32:06.813954', NULL, 'e9a216da-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841058', 'Hệ điều hành mã nguồn mở', 3, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:32:06.863922', NULL, 'e9a216da-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841068', 'Hệ thống thông tin doanh nghiệp', 3, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:40:09.351997', 'HTTT', 'e9a2184d-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841070', 'Thực tập tốt nghiệp', 6, 1, '2024-08-06 00:00:00.000000', '2024-08-11 13:32:06.820888', NULL, 'e9a216da-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841072', 'Các công nghệ lập trình hiện đại', 3, 1, '2024-08-06 00:00:00.000000', '2024-08-11 13:32:06.833956', NULL, 'e9a216da-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841073', 'Seminar chuyên đề', 3, 1, '2024-08-06 00:00:00.000000', '2024-08-11 13:32:06.841989', NULL, 'e9a216da-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841099', 'Khóa luận tốt nghiệp', 10, 1, '2024-08-06 00:00:00.000000', '2024-08-11 13:32:06.848986', NULL, 'e9a216da-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841107', 'Ngôn ngữ lập trình Java', 4, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:32:06.925940', NULL, 'e9a216da-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841108', 'Cấu trúc dữ liệu và giải thuật', 4, 1, '2024-08-06 00:00:00.000000', '2024-08-11 13:27:25.056674', NULL, 'e9a1e9de-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841109', 'Cơ sở dữ liệu', 4, 1, '2024-08-06 00:00:00.000000', '2024-08-11 13:27:25.062797', NULL, 'e9a1e9de-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841110', 'Cơ sở trí tuệ nhân tạo', 4, 1, '2024-08-06 00:00:00.000000', '2024-08-11 13:27:25.070055', NULL, 'e9a1e9de-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841111', 'Phân tích thiết kế hướng đối tượng', 4, 1, '2024-08-06 00:00:00.000000', '2024-08-11 13:57:31.440991', 'HTTT', 'e9a2184d-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841113', 'Phát triển phần mềm mã nguồn mở', 3, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:48:15.563195', 'KTPM', 'e9a2184d-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841116', 'Đồ họa máy tính', 3, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:44:18.038010', 'KHMT', 'e9a2184d-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841120', 'An toàn và bảo mật dữ liệu trong HTTT', 3, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:40:09.336701', 'HTTT', 'e9a2184d-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841303', 'Kỹ thuật lập trình', 4, 1, '2024-08-06 00:00:00.000000', '2024-08-11 13:27:25.076573', NULL, 'e9a1e9de-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841310', 'Lý thuyết đồ thị', 3, 1, '2024-08-06 00:00:00.000000', '2024-08-11 13:32:06.790144', NULL, 'e9a216da-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841319', 'An toàn mạng không dây và di động', 3, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:42:15.448772', 'KTMT', 'e9a2184d-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841320', 'Công nghệ Internet of Things', 3, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:48:15.569257', 'KTPM', 'e9a2184d-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841323', 'Điện toán đám mây', 3, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:48:15.575257', 'KTPM', 'e9a2184d-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841324', 'Phương pháp luận nghiên cứu khoa học', 2, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:32:06.870914', NULL, 'e9a216da-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841401', 'Giải tích 1', 3, 1, '2024-08-06 00:00:00.000000', '2024-08-11 13:27:24.998580', NULL, 'e9a1e9de-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841402', 'Đại số tuyến tính', 3, 1, '2024-08-06 00:00:00.000000', '2024-08-11 13:27:25.013831', NULL, 'e9a1e9de-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841403', 'Cấu trúc rời rạc', 4, 1, '2024-08-06 00:00:00.000000', '2024-08-11 13:27:25.020817', NULL, 'e9a1e9de-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841404', 'Mạng máy tính', 3, 1, '2024-08-06 00:00:00.000000', '2024-08-11 13:27:25.027580', NULL, 'e9a1e9de-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841405', 'Xác suất thống kê', 3, 1, '2024-08-06 00:00:00.000000', '2024-08-11 13:27:24.989168', NULL, 'e9a1e9de-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841406', 'Giải tích 2', 3, 1, '2024-08-06 00:00:00.000000', '2024-08-11 13:27:25.006443', NULL, 'e9a1e9de-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841407', 'Các hệ quản trị cơ sở dữ liệu', 4, 1, '2024-08-06 00:00:00.000000', '2024-08-11 13:40:09.313757', 'HTTT', 'e9a2184d-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841408', 'Kiểm thử phần mềm', 4, 1, '2024-08-06 00:00:00.000000', '2024-08-11 13:48:15.528294', 'KTPM', 'e9a2184d-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841409', 'Mạng máy tính nâng cao', 4, 1, '2024-08-06 00:00:00.000000', '2024-08-11 13:42:15.376888', 'KTMT', 'e9a2184d-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841410', 'An ninh mạng máy tính', 4, 1, '2024-08-06 00:00:00.000000', '2024-08-11 13:42:15.398949', 'KTMT', 'e9a2184d-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841411', 'Quản trị mạng', 4, 1, '2024-08-06 00:00:00.000000', '2024-08-11 13:42:15.392711', 'KTMT', 'e9a2184d-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841412', 'Nguyên lý và phương pháp lập trình', 4, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:40:09.344733', 'HTTT', 'e9a2184d-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841413', 'Cơ sở dữ liệu phân tán', 4, 1, '2024-08-06 00:00:00.000000', '2024-08-11 13:40:09.321722', 'HTTT', 'e9a2184d-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841414', 'Thiết kế và phân tích giải thuật', 3, 1, '2024-08-06 00:00:00.000000', '2024-08-11 13:32:06.826943', NULL, 'e9a216da-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841415', 'Luật pháp và CNTT', 2, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:32:06.877902', NULL, 'e9a216da-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841417', 'Mỹ thuật ứng dụng trong CNTT', 2, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:32:06.883794', NULL, 'e9a216da-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841418', 'Mô hình tài chính', 3, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:32:06.890768', NULL, 'e9a216da-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841419', 'Lập trình web và ứng dụng', 4, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:32:06.897953', NULL, 'e9a216da-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841420', 'Lập trình trực quan', 4, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:32:06.903954', NULL, 'e9a216da-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841422', 'Ngôn ngữ lập trình Python', 4, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:32:06.910918', NULL, 'e9a216da-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841423', 'Ngôn ngữ lập trình C#', 4, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:32:06.919319', NULL, 'e9a216da-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841424', 'Phương pháp mô hình hóa', 3, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:32:06.932929', NULL, 'e9a216da-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841426', 'Quản lý và bảo mật dữ liệu', 3, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:32:06.942026', NULL, 'e9a216da-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841429', 'Cơ sở dữ liệu nâng cao', 4, 1, '2024-08-06 00:00:00.000000', '2024-08-11 13:40:09.299718', 'HTTT', 'e9a2184d-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841431', 'Quản lý dự án phần mềm', 4, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:54:33.401684', NULL, 'e9a2184d-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, 'HTTT, KTPM'),
('841432', 'Phân tích dữ liệu', 4, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:40:09.364835', 'HTTT', 'e9a2184d-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841433', 'Các hệ thống cơ sở dữ liệu', 4, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:40:09.372760', 'HTTT', 'e9a2184d-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841434', 'Thương mại điện tử & ứng dụng', 4, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:40:09.379940', 'HTTT', 'e9a2184d-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841435', 'Hệ hỗ trợ quyết định', 4, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:40:09.387698', 'HTTT', 'e9a2184d-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841437', 'Các giải thuật phân tán', 4, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:42:15.418983', 'KTMT', 'e9a2184d-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841438', 'Lập trình ứng dụng mạng', 4, 1, '2024-08-06 00:00:00.000000', '2024-08-11 13:42:15.385943', 'KTMT', 'e9a2184d-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841439', 'Mạng không dây', 4, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:42:15.405009', 'KTMT', 'e9a2184d-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841440', 'Phân tích và thiết kế mạng máy tính', 4, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:42:15.411970', 'KTMT', 'e9a2184d-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841441', 'Đánh giá hiệu năng mạng', 3, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:42:15.424779', 'KTMT', 'e9a2184d-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841442', 'Mạng đa phương tiện và di động', 3, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:42:15.433856', 'KTMT', 'e9a2184d-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841443', 'Phân tích mạng truyền thông xã hội', 3, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:42:15.441868', 'KTMT', 'e9a2184d-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841444', 'Quản trị và bảo trì hệ thống', 3, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:42:15.454001', 'KTMT', 'e9a2184d-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841445', 'Hệ thống ảo và khả năng mở rộng dữ liệu', 3, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:42:15.458922', 'KTMT', 'e9a2184d-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841446', 'Phân tích và xử lý ảnh', 4, 1, '2024-08-06 00:00:00.000000', '2024-08-11 13:44:17.968847', 'KHMT', 'e9a2184d-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841447', 'Khai thác dữ liệu và ứng dụng', 4, 1, '2024-08-06 00:00:00.000000', '2024-08-11 13:44:17.985048', 'KHMT', 'e9a2184d-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841448', 'Xử lý ngôn ngữ tự nhiên', 4, 1, '2024-08-06 00:00:00.000000', '2024-08-11 13:44:17.993080', 'KHMT', 'e9a2184d-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841449', 'Nhập môn máy học', 4, 1, '2024-08-06 00:00:00.000000', '2024-08-11 13:44:18.001061', 'KHMT', 'e9a2184d-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841450', 'Nhập môn dữ liệu lớn', 4, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:44:18.011264', 'KHMT', 'e9a2184d-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841451', 'Tính toán song song', 3, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:44:18.020968', 'KHMT', 'e9a2184d-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841452', 'Tính toán thông minh', 3, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:44:18.028988', 'KHMT', 'e9a2184d-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, '');
INSERT INTO `subject` (`subjectId`, `subjectName`, `creditHour`, `isCompulsory`, `createDate`, `lastModifyDate`, `majorId`, `frameId`, `createUserId`, `lastModifyUserId`, `subjectBeforeId`, `subjectEqualId`, `listMajor`) VALUES
('841453', 'Phân tích và nhận dạng mẫu', 4, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:44:18.045087', 'KHMT', 'e9a2184d-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841454', 'Xử lý ảnh nâng cao', 4, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:44:18.052029', 'KHMT', 'e9a2184d-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841455', 'Ngôn ngữ học máy tính', 3, 0, '2024-08-06 00:00:00.000000', '2024-08-11 14:23:41.057337', 'KHMT', 'e9a2184d-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841456', 'Công nghệ tri thức', 4, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:44:18.059993', 'KHMT', 'e9a2184d-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841457', 'Học sâu', 4, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:44:18.068247', 'KHMT', 'e9a2184d-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841458', 'Trí tuệ nhân tạo nâng cao', 4, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:44:18.074954', 'KHMT', 'e9a2184d-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841461', 'Nhập môn phát triển ứng dụng trên thiết bị di động', 4, 1, '2024-08-06 00:00:00.000000', '2024-08-11 13:48:15.541201', 'KTPM', 'e9a2184d-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841463', 'Phát triển ứng dụng trên thiết bị di động nâng cao', 4, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:48:15.548371', 'KTPM', 'e9a2184d-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841464', 'Lập trình Web và ứng dụng nâng cao', 4, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:48:15.555240', 'KTPM', 'e9a2184d-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841467', 'Công nghệ .NET', 4, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:48:15.582307', 'KTPM', 'e9a2184d-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841468', 'Chuyên đề J2EE', 4, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:48:15.589257', 'KTPM', 'e9a2184d-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841470', 'Tương tác người máy', 4, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:48:15.596388', 'KTPM', 'e9a2184d-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841476', 'Đồ án chuyên ngành', 4, 1, '2024-08-06 00:00:00.000000', '2024-08-11 13:32:06.855964', NULL, 'e9a216da-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841480', 'Xây dựng phần mềm theo mô hình phân lớp (2020)', 4, 1, '2024-08-06 00:00:00.000000', '2024-08-11 13:48:15.515349', 'KTPM', 'e9a2184d-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('841481', 'Thiết kế giao diện', 4, 1, '2024-08-06 00:00:00.000000', '2024-08-11 13:48:15.535272', 'KTPM', 'e9a2184d-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('861301', 'Triết học Mác – Lênin', 3, 1, '2024-08-06 00:00:00.000000', '2024-08-11 13:24:26.683957', NULL, 'e99e7204-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('861302', 'Kinh tế chính trị Mác – Lênin', 2, 1, '2024-08-06 00:00:00.000000', '2024-08-11 13:24:26.692950', NULL, 'e99e7204-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('861303', 'Chủ nghĩa xã hội khoa học', 2, 1, '2024-08-06 00:00:00.000000', '2024-08-11 13:24:26.698962', NULL, 'e99e7204-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('861304', 'Tư tưởng Hồ Chí Minh', 2, 1, '2024-08-06 00:00:00.000000', '2024-08-11 13:24:26.705003', NULL, 'e99e7204-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('861305', 'Lịch sử Đảng Cộng sản Việt Nam', 2, 1, '2024-08-06 00:00:00.000000', '2024-08-11 13:24:26.711012', NULL, 'e99e7204-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('862101', 'Giáo dục thể chất (I)', 1, 1, '2024-08-06 00:00:00.000000', '2024-08-11 13:24:26.716687', NULL, 'e99e7204-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('862406', 'Giáo dục quốc phòng và an ninh I', 3, 1, '2024-08-06 00:00:00.000000', '2024-08-11 13:24:26.722885', NULL, 'e99e7204-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('862407', 'Giáo dục quốc phòng và an ninh II', 2, 1, '2024-08-06 00:00:00.000000', '2024-08-11 13:24:26.728927', NULL, 'e99e7204-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('862408', 'Giáo dục quốc phòng và an ninh III', 2, 1, '2024-08-06 00:00:00.000000', '2024-08-11 13:24:26.735973', NULL, 'e99e7204-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('862409', 'Giáo dục quốc phòng và an ninh IV', 4, 1, '2024-08-06 00:00:00.000000', '2024-08-11 13:24:26.742022', NULL, 'e99e7204-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('865006', 'Pháp luật đại cương', 2, 1, '2024-08-06 00:00:00.000000', '2024-08-11 13:24:26.747941', NULL, 'e99e7204-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('866101', 'Tiếng Anh I', 2, 1, '2024-08-06 00:00:00.000000', '2024-08-11 13:24:26.754214', NULL, 'e99e7204-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('866102', 'Tiếng Anh II', 2, 1, '2024-08-06 00:00:00.000000', '2024-08-11 13:24:26.759942', NULL, 'e99e7204-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('866103', 'Tiếng Anh III', 3, 1, '2024-08-06 00:00:00.000000', '2024-08-11 13:24:26.770896', NULL, 'e99e7204-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('BOBA11', 'Bóng bàn 1', 1, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:24:26.776901', NULL, 'e99e7204-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('BOBA12', 'Bóng bàn 2', 1, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:24:26.782719', NULL, 'e99e7204-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('BOCH11', 'Bóng chuyền 1', 1, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:24:26.788017', NULL, 'e99e7204-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('BOCH12', 'Bóng chuyền 2', 1, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:24:26.793834', NULL, 'e99e7204-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('BODA11', 'Bóng đá 1', 1, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:24:26.799940', NULL, 'e99e7204-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('BODA12', 'Bóng đá 2', 1, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:24:26.804972', NULL, 'e99e7204-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('BORO11', 'Bóng rổ 1', 1, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:24:26.810038', NULL, 'e99e7204-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('BORO12', 'Bóng rổ 2', 1, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:24:26.815940', NULL, 'e99e7204-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('CALO11', 'Cầu lông 1', 1, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:24:26.821004', NULL, 'e99e7204-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, ''),
('CALO12', 'Cầu lông 2', 1, 0, '2024-08-06 00:00:00.000000', '2024-08-11 13:24:26.825859', NULL, 'e99e7204-579b-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', NULL, NULL, '');

INSERT INTO `subject_semester` (`id`, `subjectId`, `semesterId`) VALUES
('04cfd708-5491-11ef-b112-1aa268f50191', '841068', '69c9c743-579b-11ef-aca7-1aa268f50191');
INSERT INTO `subject_semester` (`id`, `subjectId`, `semesterId`) VALUES
('04cfe227-5491-11ef-b112-1aa268f50191', '841068', '69c9c949-579b-11ef-aca7-1aa268f50191');
INSERT INTO `subject_semester` (`id`, `subjectId`, `semesterId`) VALUES
('04cfe53b-5491-11ef-b112-1aa268f50191', '841068', '69c9cc5d-579b-11ef-aca7-1aa268f50191');
INSERT INTO `subject_semester` (`id`, `subjectId`, `semesterId`) VALUES
('04cfe6b8-5491-11ef-b112-1aa268f50191', '841068', '69c9ce49-579b-11ef-aca7-1aa268f50191'),
('04e3df36-548e-11ef-b112-1aa268f50191', '861302', '69c7b632-579b-11ef-aca7-1aa268f50191'),
('04e441ef-548e-11ef-b112-1aa268f50191', '861303', '69c9b5c8-579b-11ef-aca7-1aa268f50191'),
('04e4492c-548e-11ef-b112-1aa268f50191', '861304', '69c9becc-579b-11ef-aca7-1aa268f50191'),
('04e44c70-548e-11ef-b112-1aa268f50191', '861305', '69c9c321-579b-11ef-aca7-1aa268f50191'),
('09c4b329-5491-11ef-b112-1aa268f50191', '841431', '69c9c743-579b-11ef-aca7-1aa268f50191'),
('09c4e2b2-5491-11ef-b112-1aa268f50191', '841431', '69c9c949-579b-11ef-aca7-1aa268f50191'),
('09c4e62a-5491-11ef-b112-1aa268f50191', '841431', '69c9cc5d-579b-11ef-aca7-1aa268f50191'),
('09c4e818-5491-11ef-b112-1aa268f50191', '841431', '69c9ce49-579b-11ef-aca7-1aa268f50191'),
('102d0538-5491-11ef-b112-1aa268f50191', '841432', '69c9c743-579b-11ef-aca7-1aa268f50191'),
('102d51e2-5491-11ef-b112-1aa268f50191', '841432', '69c9c949-579b-11ef-aca7-1aa268f50191'),
('102d5458-5491-11ef-b112-1aa268f50191', '841432', '69c9cc5d-579b-11ef-aca7-1aa268f50191'),
('102d55cd-5491-11ef-b112-1aa268f50191', '841432', '69c9ce49-579b-11ef-aca7-1aa268f50191'),
('16271b00-5491-11ef-b112-1aa268f50191', '841433', '69c9c743-579b-11ef-aca7-1aa268f50191'),
('1627260e-5491-11ef-b112-1aa268f50191', '841433', '69c9c949-579b-11ef-aca7-1aa268f50191'),
('162728a3-5491-11ef-b112-1aa268f50191', '841433', '69c9cc5d-579b-11ef-aca7-1aa268f50191'),
('16272a02-5491-11ef-b112-1aa268f50191', '841433', '69c9ce49-579b-11ef-aca7-1aa268f50191'),
('164403fd-5492-11ef-b112-1aa268f50191', '841457', '69c9c743-579b-11ef-aca7-1aa268f50191'),
('16443147-5492-11ef-b112-1aa268f50191', '841457', '69c9c949-579b-11ef-aca7-1aa268f50191'),
('164435ff-5492-11ef-b112-1aa268f50191', '841457', '69c9cc5d-579b-11ef-aca7-1aa268f50191'),
('164438a9-5492-11ef-b112-1aa268f50191', '841457', '69c9ce49-579b-11ef-aca7-1aa268f50191'),
('1b63062a-5491-11ef-b112-1aa268f50191', '841434', '69c9c743-579b-11ef-aca7-1aa268f50191'),
('1b6310c7-5491-11ef-b112-1aa268f50191', '841434', '69c9c949-579b-11ef-aca7-1aa268f50191'),
('1b631315-5491-11ef-b112-1aa268f50191', '841434', '69c9cc5d-579b-11ef-aca7-1aa268f50191'),
('1b631538-5491-11ef-b112-1aa268f50191', '841434', '69c9ce49-579b-11ef-aca7-1aa268f50191'),
('1e22dcfc-5492-11ef-b112-1aa268f50191', '841458', '69c9c743-579b-11ef-aca7-1aa268f50191'),
('1e22fd46-5492-11ef-b112-1aa268f50191', '841458', '69c9c949-579b-11ef-aca7-1aa268f50191'),
('1e22fffb-5492-11ef-b112-1aa268f50191', '841458', '69c9cc5d-579b-11ef-aca7-1aa268f50191'),
('1e232c5e-5492-11ef-b112-1aa268f50191', '841458', '69c9ce49-579b-11ef-aca7-1aa268f50191'),
('20ee03ba-5491-11ef-b112-1aa268f50191', '841435', '69c9c743-579b-11ef-aca7-1aa268f50191'),
('20ee7537-5491-11ef-b112-1aa268f50191', '841435', '69c9c949-579b-11ef-aca7-1aa268f50191'),
('20ee781c-5491-11ef-b112-1aa268f50191', '841435', '69c9cc5d-579b-11ef-aca7-1aa268f50191'),
('20ee79ed-5491-11ef-b112-1aa268f50191', '841435', '69c9ce49-579b-11ef-aca7-1aa268f50191'),
('2b927b9a-5490-11ef-b112-1aa268f50191', '841324', '69c9b5c8-579b-11ef-aca7-1aa268f50191'),
('2b92a80e-5490-11ef-b112-1aa268f50191', '841324', '69c9becc-579b-11ef-aca7-1aa268f50191'),
('2b92ab99-5490-11ef-b112-1aa268f50191', '841324', '69c9c321-579b-11ef-aca7-1aa268f50191'),
('2b92ad34-5490-11ef-b112-1aa268f50191', '841324', '69c9c743-579b-11ef-aca7-1aa268f50191'),
('2b92f098-5490-11ef-b112-1aa268f50191', '841324', '69c9c949-579b-11ef-aca7-1aa268f50191'),
('2b92f2a0-5490-11ef-b112-1aa268f50191', '841324', '69c9cc5d-579b-11ef-aca7-1aa268f50191'),
('2b92f3e0-5490-11ef-b112-1aa268f50191', '841324', '69c9ce49-579b-11ef-aca7-1aa268f50191'),
('2d1ac4b8-548e-11ef-b112-1aa268f50191', '866101', '69c7b632-579b-11ef-aca7-1aa268f50191'),
('2d1aefa8-548e-11ef-b112-1aa268f50191', '866102', '69c9b5c8-579b-11ef-aca7-1aa268f50191'),
('2d1b3258-548e-11ef-b112-1aa268f50191', '866103', '69c9becc-579b-11ef-aca7-1aa268f50191'),
('37b908f1-5491-11ef-b112-1aa268f50191', '841409', '69c9c321-579b-11ef-aca7-1aa268f50191'),
('37b93213-5491-11ef-b112-1aa268f50191', '841438', '69c9c743-579b-11ef-aca7-1aa268f50191'),
('37b93512-5491-11ef-b112-1aa268f50191', '841411', '69c9c321-579b-11ef-aca7-1aa268f50191'),
('37b93695-5491-11ef-b112-1aa268f50191', '841410', '69c9c743-579b-11ef-aca7-1aa268f50191'),
('42fe40fa-548f-11ef-b112-1aa268f50191', '841405', '69c7b632-579b-11ef-aca7-1aa268f50191'),
('42fe8139-548f-11ef-b112-1aa268f50191', '841401', '69c5bac6-579b-11ef-aca7-1aa268f50191'),
('42fe865b-548f-11ef-b112-1aa268f50191', '841406', '69c7b632-579b-11ef-aca7-1aa268f50191'),
('42fe8926-548f-11ef-b112-1aa268f50191', '841402', '69c5bac6-579b-11ef-aca7-1aa268f50191'),
('42fecd9b-548f-11ef-b112-1aa268f50191', '841020', '69c5bac6-579b-11ef-aca7-1aa268f50191'),
('42fed0d8-548f-11ef-b112-1aa268f50191', '841303', '69c7b632-579b-11ef-aca7-1aa268f50191'),
('42fed969-548f-11ef-b112-1aa268f50191', '841021', '69c5bac6-579b-11ef-aca7-1aa268f50191'),
('42fedc29-548f-11ef-b112-1aa268f50191', '841022', '69c9b5c8-579b-11ef-aca7-1aa268f50191'),
('42fee29a-548f-11ef-b112-1aa268f50191', '841403', '69c5bac6-579b-11ef-aca7-1aa268f50191'),
('42fee714-548f-11ef-b112-1aa268f50191', '841108', '69c7b632-579b-11ef-aca7-1aa268f50191'),
('42feeb9e-548f-11ef-b112-1aa268f50191', '841404', '69c7b632-579b-11ef-aca7-1aa268f50191'),
('42ff36e6-548f-11ef-b112-1aa268f50191', '841044', '69c9b5c8-579b-11ef-aca7-1aa268f50191'),
('42ff3a85-548f-11ef-b112-1aa268f50191', '841109', '69c9b5c8-579b-11ef-aca7-1aa268f50191'),
('42ff3fb9-548f-11ef-b112-1aa268f50191', '841109', '69c9becc-579b-11ef-aca7-1aa268f50191'),
('56243dd6-5491-11ef-b112-1aa268f50191', '841439', '69c9c743-579b-11ef-aca7-1aa268f50191'),
('56247c61-5491-11ef-b112-1aa268f50191', '841439', '69c9c949-579b-11ef-aca7-1aa268f50191'),
('5624805b-5491-11ef-b112-1aa268f50191', '841439', '69c9cc5d-579b-11ef-aca7-1aa268f50191'),
('562483dd-5491-11ef-b112-1aa268f50191', '841439', '69c9ce49-579b-11ef-aca7-1aa268f50191'),
('5bb2c33b-57a5-11ef-b480-1aa268f50191', '841058', '69c9becc-579b-11ef-aca7-1aa268f50191'),
('5bb519e7-57a5-11ef-b480-1aa268f50191', '841468', '69c9cc5d-579b-11ef-aca7-1aa268f50191'),
('5bb8e66a-5491-11ef-b112-1aa268f50191', '841440', '69c9c743-579b-11ef-aca7-1aa268f50191'),
('5bb8f1c9-5491-11ef-b112-1aa268f50191', '841440', '69c9c949-579b-11ef-aca7-1aa268f50191'),
('5bb8f49c-5491-11ef-b112-1aa268f50191', '841440', '69c9cc5d-579b-11ef-aca7-1aa268f50191'),
('5bb8f714-5491-11ef-b112-1aa268f50191', '841440', '69c9ce49-579b-11ef-aca7-1aa268f50191'),
('5d207125-5492-11ef-b112-1aa268f50191', '841480', '69c9c743-579b-11ef-aca7-1aa268f50191'),
('5d20a708-5492-11ef-b112-1aa268f50191', '841408', '69c9c321-579b-11ef-aca7-1aa268f50191'),
('5d20ab0b-5492-11ef-b112-1aa268f50191', '841481', '69c9c743-579b-11ef-aca7-1aa268f50191'),
('5d20acfa-5492-11ef-b112-1aa268f50191', '841461', '69c9c321-579b-11ef-aca7-1aa268f50191'),
('5f4754ef-548d-11ef-b112-1aa268f50191', '861301', '69c5bac6-579b-11ef-aca7-1aa268f50191'),
('60fc8eb9-5491-11ef-b112-1aa268f50191', '841437', '69c9c743-579b-11ef-aca7-1aa268f50191'),
('60fcb302-5491-11ef-b112-1aa268f50191', '841437', '69c9c949-579b-11ef-aca7-1aa268f50191'),
('60fcbc72-5491-11ef-b112-1aa268f50191', '841437', '69c9cc5d-579b-11ef-aca7-1aa268f50191'),
('60fcbef2-5491-11ef-b112-1aa268f50191', '841437', '69c9ce49-579b-11ef-aca7-1aa268f50191'),
('66fb56bc-5491-11ef-b112-1aa268f50191', '841441', '69c9c743-579b-11ef-aca7-1aa268f50191'),
('66fb7880-5491-11ef-b112-1aa268f50191', '841441', '69c9c949-579b-11ef-aca7-1aa268f50191'),
('66fb85e7-5491-11ef-b112-1aa268f50191', '841441', '69c9cc5d-579b-11ef-aca7-1aa268f50191'),
('66fb879e-5491-11ef-b112-1aa268f50191', '841441', '69c9ce49-579b-11ef-aca7-1aa268f50191'),
('6bc33c30-5491-11ef-b112-1aa268f50191', '841442', '69c9c743-579b-11ef-aca7-1aa268f50191'),
('6bc34685-5491-11ef-b112-1aa268f50191', '841442', '69c9c949-579b-11ef-aca7-1aa268f50191'),
('6bc3483f-5491-11ef-b112-1aa268f50191', '841442', '69c9cc5d-579b-11ef-aca7-1aa268f50191'),
('6bc3498d-5491-11ef-b112-1aa268f50191', '841442', '69c9ce49-579b-11ef-aca7-1aa268f50191'),
('6f2db5e6-5490-11ef-b112-1aa268f50191', '841415', '69c9b5c8-579b-11ef-aca7-1aa268f50191'),
('6f2ddf68-5490-11ef-b112-1aa268f50191', '841415', '69c9c321-579b-11ef-aca7-1aa268f50191'),
('6f2de35a-5490-11ef-b112-1aa268f50191', '841415', '69c9c949-579b-11ef-aca7-1aa268f50191'),
('6f2de5e6-5490-11ef-b112-1aa268f50191', '841415', '69c9cc5d-579b-11ef-aca7-1aa268f50191'),
('6f2de80d-5490-11ef-b112-1aa268f50191', '841415', '69c9cc5d-579b-11ef-aca7-1aa268f50191'),
('7f3da59c-5491-11ef-b112-1aa268f50191', '841442', '69c9c321-579b-11ef-aca7-1aa268f50191'),
('877173a8-5491-11ef-b112-1aa268f50191', '841319', '69c9c743-579b-11ef-aca7-1aa268f50191'),
('87719721-5491-11ef-b112-1aa268f50191', '841319', '69c9c949-579b-11ef-aca7-1aa268f50191'),
('87720f15-5491-11ef-b112-1aa268f50191', '841319', '69c9cc5d-579b-11ef-aca7-1aa268f50191'),
('87721297-5491-11ef-b112-1aa268f50191', '841319', '69c9ce49-579b-11ef-aca7-1aa268f50191'),
('8a131de0-548e-11ef-b112-1aa268f50191', '865006', '69c9c321-579b-11ef-aca7-1aa268f50191'),
('8a137f15-548e-11ef-b112-1aa268f50191', '862101', '69c18939-579b-11ef-aca7-1aa268f50191'),
('8a1383a1-548e-11ef-b112-1aa268f50191', '862406', '69c18939-579b-11ef-aca7-1aa268f50191'),
('8a138575-548e-11ef-b112-1aa268f50191', '862407', '69c18939-579b-11ef-aca7-1aa268f50191'),
('8a13b086-548e-11ef-b112-1aa268f50191', '862408', '69c18939-579b-11ef-aca7-1aa268f50191'),
('8a13b7c2-548e-11ef-b112-1aa268f50191', '862409', '69c18939-579b-11ef-aca7-1aa268f50191'),
('8ce9433a-5491-11ef-b112-1aa268f50191', '841444', '69c9c743-579b-11ef-aca7-1aa268f50191'),
('8ce95db9-5491-11ef-b112-1aa268f50191', '841444', '69c9c949-579b-11ef-aca7-1aa268f50191'),
('8ce96116-5491-11ef-b112-1aa268f50191', '841444', '69c9cc5d-579b-11ef-aca7-1aa268f50191'),
('8ce963e2-5491-11ef-b112-1aa268f50191', '841444', '69c9ce49-579b-11ef-aca7-1aa268f50191'),
('923bcd51-5491-11ef-b112-1aa268f50191', '841445', '69c9c743-579b-11ef-aca7-1aa268f50191'),
('923bd678-5491-11ef-b112-1aa268f50191', '841445', '69c9c949-579b-11ef-aca7-1aa268f50191'),
('923bd836-5491-11ef-b112-1aa268f50191', '841445', '69c9cc5d-579b-11ef-aca7-1aa268f50191'),
('923bd9e3-5491-11ef-b112-1aa268f50191', '841445', '69c9ce49-579b-11ef-aca7-1aa268f50191'),
('92f20c3e-548f-11ef-b112-1aa268f50191', '841310', '69c9b5c8-579b-11ef-aca7-1aa268f50191'),
('92f240d0-548f-11ef-b112-1aa268f50191', '841047', '69c9c321-579b-11ef-aca7-1aa268f50191'),
('92f243bd-548f-11ef-b112-1aa268f50191', '841414', '69c9c743-579b-11ef-aca7-1aa268f50191'),
('92f2453f-548f-11ef-b112-1aa268f50191', '841048', '69c9becc-579b-11ef-aca7-1aa268f50191'),
('92f24681-548f-11ef-b112-1aa268f50191', '841070', '69c9c949-579b-11ef-aca7-1aa268f50191'),
('92f247c6-548f-11ef-b112-1aa268f50191', '841070', '69c9cc5d-579b-11ef-aca7-1aa268f50191'),
('92f27ab9-548f-11ef-b112-1aa268f50191', '841070', '69c9ce49-579b-11ef-aca7-1aa268f50191'),
('98d52097-5492-11ef-b112-1aa268f50191', '841464', '69c9becc-579b-11ef-aca7-1aa268f50191'),
('98d55ef4-5492-11ef-b112-1aa268f50191', '841464', '69c9c743-579b-11ef-aca7-1aa268f50191'),
('98d562d1-5492-11ef-b112-1aa268f50191', '841464', '69c9c949-579b-11ef-aca7-1aa268f50191'),
('98d5669f-5492-11ef-b112-1aa268f50191', '841464', '69c9cc5d-579b-11ef-aca7-1aa268f50191'),
('98d569fa-5492-11ef-b112-1aa268f50191', '841464', '69c9ce49-579b-11ef-aca7-1aa268f50191'),
('a8230fd2-5491-11ef-b112-1aa268f50191', '841446', '69c9c743-579b-11ef-aca7-1aa268f50191'),
('a8234cc8-5491-11ef-b112-1aa268f50191', '841447', '69c9c743-579b-11ef-aca7-1aa268f50191'),
('a823500f-5491-11ef-b112-1aa268f50191', '841448', '69c9c321-579b-11ef-aca7-1aa268f50191'),
('a8235341-5491-11ef-b112-1aa268f50191', '841449', '69c9c321-579b-11ef-aca7-1aa268f50191'),
('a946ec00-5492-11ef-b112-1aa268f50191', '841320', '69c9c743-579b-11ef-aca7-1aa268f50191'),
('a9471a0b-5492-11ef-b112-1aa268f50191', '841320', '69c9c949-579b-11ef-aca7-1aa268f50191'),
('a9471ce2-5492-11ef-b112-1aa268f50191', '841320', '69c9cc5d-579b-11ef-aca7-1aa268f50191'),
('a9471eb5-5492-11ef-b112-1aa268f50191', '841320', '69c9ce49-579b-11ef-aca7-1aa268f50191'),
('accd2d00-548f-11ef-b112-1aa268f50191', '841099', '69c9cc5d-579b-11ef-aca7-1aa268f50191'),
('accd6046-548f-11ef-b112-1aa268f50191', '841099', '69c9ce49-579b-11ef-aca7-1aa268f50191'),
('adb703e4-5490-11ef-b112-1aa268f50191', '841417', '69c9b5c8-579b-11ef-aca7-1aa268f50191'),
('adb72e92-5490-11ef-b112-1aa268f50191', '841418', '69c9c321-579b-11ef-aca7-1aa268f50191'),
('adb7310f-5490-11ef-b112-1aa268f50191', '841419', '69c9b5c8-579b-11ef-aca7-1aa268f50191'),
('adb73294-5490-11ef-b112-1aa268f50191', '841420', '69c9becc-579b-11ef-aca7-1aa268f50191'),
('adb73496-5490-11ef-b112-1aa268f50191', '841422', '69c9becc-579b-11ef-aca7-1aa268f50191'),
('adb735db-5490-11ef-b112-1aa268f50191', '841423', '69c9c321-579b-11ef-aca7-1aa268f50191'),
('adb73769-5490-11ef-b112-1aa268f50191', '841107', '69c9becc-579b-11ef-aca7-1aa268f50191'),
('adb738d6-5490-11ef-b112-1aa268f50191', '841424', '69c9c949-579b-11ef-aca7-1aa268f50191'),
('adb73a12-5490-11ef-b112-1aa268f50191', '841426', '69c9c949-579b-11ef-aca7-1aa268f50191'),
('af233cea-5492-11ef-b112-1aa268f50191', '841323', '69c9c743-579b-11ef-aca7-1aa268f50191'),
('af23537a-5492-11ef-b112-1aa268f50191', '841323', '69c9c949-579b-11ef-aca7-1aa268f50191'),
('af2355f8-5492-11ef-b112-1aa268f50191', '841323', '69c9cc5d-579b-11ef-aca7-1aa268f50191'),
('af2357c0-5492-11ef-b112-1aa268f50191', '841323', '69c9ce49-579b-11ef-aca7-1aa268f50191'),
('b395b65f-5492-11ef-b112-1aa268f50191', '841431', '69c9c743-579b-11ef-aca7-1aa268f50191'),
('b395c0c4-5492-11ef-b112-1aa268f50191', '841431', '69c9c949-579b-11ef-aca7-1aa268f50191'),
('b395c2b4-5492-11ef-b112-1aa268f50191', '841431', '69c9cc5d-579b-11ef-aca7-1aa268f50191'),
('b395c40d-5492-11ef-b112-1aa268f50191', '841431', '69c9ce49-579b-11ef-aca7-1aa268f50191'),
('b7e7d48f-5492-11ef-b112-1aa268f50191', '841467', '69c9c743-579b-11ef-aca7-1aa268f50191'),
('b7e81e53-5492-11ef-b112-1aa268f50191', '841467', '69c9c949-579b-11ef-aca7-1aa268f50191'),
('b7e82507-5492-11ef-b112-1aa268f50191', '841467', '69c9cc5d-579b-11ef-aca7-1aa268f50191'),
('b7e827b9-5492-11ef-b112-1aa268f50191', '841467', '69c9ce49-579b-11ef-aca7-1aa268f50191'),
('bc697d52-548e-11ef-b112-1aa268f50191', 'BOBA11', '69c18939-579b-11ef-aca7-1aa268f50191'),
('bc69a30b-548e-11ef-b112-1aa268f50191', 'BOBA12', '69c18939-579b-11ef-aca7-1aa268f50191'),
('bc69a5ea-548e-11ef-b112-1aa268f50191', 'BODA11', '69c18939-579b-11ef-aca7-1aa268f50191'),
('bc69e129-548e-11ef-b112-1aa268f50191', 'BODA12', '69c18939-579b-11ef-aca7-1aa268f50191'),
('bc69e35a-548e-11ef-b112-1aa268f50191', 'BOCH11', '69c18939-579b-11ef-aca7-1aa268f50191'),
('bc69e499-548e-11ef-b112-1aa268f50191', 'BOCH12', '69c18939-579b-11ef-aca7-1aa268f50191'),
('bc69e5c9-548e-11ef-b112-1aa268f50191', 'BORO11', '69c18939-579b-11ef-aca7-1aa268f50191'),
('bc69e74f-548e-11ef-b112-1aa268f50191', 'BORO12', '69c18939-579b-11ef-aca7-1aa268f50191'),
('bc69e89e-548e-11ef-b112-1aa268f50191', 'CALO11', '69c18939-579b-11ef-aca7-1aa268f50191'),
('bc69e9bf-548e-11ef-b112-1aa268f50191', 'CALO12', '69c18939-579b-11ef-aca7-1aa268f50191'),
('bdc7e030-5492-11ef-b112-1aa268f50191', '841468', '69c9c743-579b-11ef-aca7-1aa268f50191'),
('bdc7fde5-5492-11ef-b112-1aa268f50191', '841468', '69c9c949-579b-11ef-aca7-1aa268f50191'),
('bdc80379-5492-11ef-b112-1aa268f50191', '841468', '69c9ce49-579b-11ef-aca7-1aa268f50191'),
('c2ce894b-5492-11ef-b112-1aa268f50191', '841470', '69c9c743-579b-11ef-aca7-1aa268f50191'),
('c2ce9472-5492-11ef-b112-1aa268f50191', '841470', '69c9c949-579b-11ef-aca7-1aa268f50191'),
('c2ce9743-5492-11ef-b112-1aa268f50191', '841470', '69c9cc5d-579b-11ef-aca7-1aa268f50191'),
('c2ce99c8-5492-11ef-b112-1aa268f50191', '841470', '69c9ce49-579b-11ef-aca7-1aa268f50191'),
('c64e526b-5491-11ef-b112-1aa268f50191', '841450', '69c9c743-579b-11ef-aca7-1aa268f50191'),
('c64e7cae-5491-11ef-b112-1aa268f50191', '841450', '69c9c949-579b-11ef-aca7-1aa268f50191'),
('c64e8020-5491-11ef-b112-1aa268f50191', '841450', '69c9cc5d-579b-11ef-aca7-1aa268f50191'),
('c64ebc0f-5491-11ef-b112-1aa268f50191', '841450', '69c9ce49-579b-11ef-aca7-1aa268f50191'),
('c864ff59-5492-11ef-b112-1aa268f50191', '841463', '69c9c743-579b-11ef-aca7-1aa268f50191'),
('c8651470-5492-11ef-b112-1aa268f50191', '841463', '69c9c949-579b-11ef-aca7-1aa268f50191'),
('c865172b-5492-11ef-b112-1aa268f50191', '841463', '69c9cc5d-579b-11ef-aca7-1aa268f50191'),
('c86518a7-5492-11ef-b112-1aa268f50191', '841463', '69c9ce49-579b-11ef-aca7-1aa268f50191'),
('cb2f9bbe-5491-11ef-b112-1aa268f50191', '841451', '69c9c743-579b-11ef-aca7-1aa268f50191'),
('cb2fb4b8-5491-11ef-b112-1aa268f50191', '841451', '69c9c949-579b-11ef-aca7-1aa268f50191'),
('cb2fb8cd-5491-11ef-b112-1aa268f50191', '841451', '69c9cc5d-579b-11ef-aca7-1aa268f50191'),
('cb2fbc09-5491-11ef-b112-1aa268f50191', '841451', '69c9ce49-579b-11ef-aca7-1aa268f50191'),
('ce97b270-5490-11ef-b112-1aa268f50191', '841429', '69c9c321-579b-11ef-aca7-1aa268f50191'),
('ce97db2f-5490-11ef-b112-1aa268f50191', '841407', '69c9c743-579b-11ef-aca7-1aa268f50191'),
('ce97df70-5490-11ef-b112-1aa268f50191', '841413', '69c9c743-579b-11ef-aca7-1aa268f50191'),
('ce97e126-5490-11ef-b112-1aa268f50191', '841111', '69c9c949-579b-11ef-aca7-1aa268f50191'),
('d121201a-5491-11ef-b112-1aa268f50191', '841452', '69c9c743-579b-11ef-aca7-1aa268f50191'),
('d121388e-5491-11ef-b112-1aa268f50191', '841452', '69c9c949-579b-11ef-aca7-1aa268f50191'),
('d1213b37-5491-11ef-b112-1aa268f50191', '841452', '69c9cc5d-579b-11ef-aca7-1aa268f50191'),
('d1213cb5-5491-11ef-b112-1aa268f50191', '841452', '69c9ce49-579b-11ef-aca7-1aa268f50191'),
('d4f8067a-548f-11ef-b112-1aa268f50191', '841073', '69c9cc5d-579b-11ef-aca7-1aa268f50191'),
('d4f82a3b-548f-11ef-b112-1aa268f50191', '841073', '69c9ce49-579b-11ef-aca7-1aa268f50191'),
('d4f82c87-548f-11ef-b112-1aa268f50191', '841072', '69c9cc5d-579b-11ef-aca7-1aa268f50191'),
('d4f82e0a-548f-11ef-b112-1aa268f50191', '841072', '69c9ce49-579b-11ef-aca7-1aa268f50191'),
('d4f867ae-548f-11ef-b112-1aa268f50191', '841476', '69c9cc5d-579b-11ef-aca7-1aa268f50191'),
('d4f86c81-548f-11ef-b112-1aa268f50191', '841476', '69c9ce49-579b-11ef-aca7-1aa268f50191'),
('d81cb0b1-5491-11ef-b112-1aa268f50191', '841116', '69c9c743-579b-11ef-aca7-1aa268f50191'),
('d81ccf45-5491-11ef-b112-1aa268f50191', '841116', '69c9c949-579b-11ef-aca7-1aa268f50191'),
('d81cd1b3-5491-11ef-b112-1aa268f50191', '841116', '69c9cc5d-579b-11ef-aca7-1aa268f50191'),
('d81cd339-5491-11ef-b112-1aa268f50191', '841116', '69c9ce49-579b-11ef-aca7-1aa268f50191'),
('dfa3be71-5491-11ef-b112-1aa268f50191', '841453', '69c9c743-579b-11ef-aca7-1aa268f50191'),
('dfa3da7f-5491-11ef-b112-1aa268f50191', '841453', '69c9c949-579b-11ef-aca7-1aa268f50191'),
('dfa3dcee-5491-11ef-b112-1aa268f50191', '841453', '69c9cc5d-579b-11ef-aca7-1aa268f50191'),
('dfa3dec2-5491-11ef-b112-1aa268f50191', '841453', '69c9ce49-579b-11ef-aca7-1aa268f50191'),
('e604411e-5491-11ef-b112-1aa268f50191', '841454', '69c9c743-579b-11ef-aca7-1aa268f50191'),
('e6045706-5491-11ef-b112-1aa268f50191', '841454', '69c9c949-579b-11ef-aca7-1aa268f50191'),
('e60494a9-5491-11ef-b112-1aa268f50191', '841454', '69c9cc5d-579b-11ef-aca7-1aa268f50191'),
('e6049685-5491-11ef-b112-1aa268f50191', '841454', '69c9ce49-579b-11ef-aca7-1aa268f50191'),
('eac1bb39-5491-11ef-b112-1aa268f50191', '841455', '69c9c743-579b-11ef-aca7-1aa268f50191'),
('eac1e4b5-5491-11ef-b112-1aa268f50191', '841455', '69c9c949-579b-11ef-aca7-1aa268f50191'),
('eac1e9a8-5491-11ef-b112-1aa268f50191', '841455', '69c9cc5d-579b-11ef-aca7-1aa268f50191'),
('eac1ec49-5491-11ef-b112-1aa268f50191', '841455', '69c9ce49-579b-11ef-aca7-1aa268f50191'),
('f1f136da-5491-11ef-b112-1aa268f50191', '841455', '69c9c743-579b-11ef-aca7-1aa268f50191'),
('f1f14ff9-5491-11ef-b112-1aa268f50191', '841455', '69c9c949-579b-11ef-aca7-1aa268f50191'),
('f1f1524f-5491-11ef-b112-1aa268f50191', '841455', '69c9cc5d-579b-11ef-aca7-1aa268f50191'),
('f1f153ba-5491-11ef-b112-1aa268f50191', '841455', '69c9ce49-579b-11ef-aca7-1aa268f50191'),
('f84c508b-5490-11ef-b112-1aa268f50191', '841120', '69c9c743-579b-11ef-aca7-1aa268f50191'),
('f84c72d3-5490-11ef-b112-1aa268f50191', '841120', '69c9c949-579b-11ef-aca7-1aa268f50191'),
('f84c7546-5490-11ef-b112-1aa268f50191', '841120', '69c9cc5d-579b-11ef-aca7-1aa268f50191'),
('f84c773b-5490-11ef-b112-1aa268f50191', '841120', '69c9ce49-579b-11ef-aca7-1aa268f50191'),
('fb834982-5491-11ef-b112-1aa268f50191', '841456', '69c9c743-579b-11ef-aca7-1aa268f50191'),
('fb8370d0-5491-11ef-b112-1aa268f50191', '841456', '69c9c949-579b-11ef-aca7-1aa268f50191'),
('fb8373fe-5491-11ef-b112-1aa268f50191', '841456', '69c9cc5d-579b-11ef-aca7-1aa268f50191'),
('fb837716-5491-11ef-b112-1aa268f50191', '841456', '69c9ce49-579b-11ef-aca7-1aa268f50191'),
('fefb7274-5490-11ef-b112-1aa268f50191', '841412', '69c9c743-579b-11ef-aca7-1aa268f50191'),
('fefb9113-5490-11ef-b112-1aa268f50191', '841412', '69c9c949-579b-11ef-aca7-1aa268f50191'),
('fefbbeab-5490-11ef-b112-1aa268f50191', '841412', '69c9cc5d-579b-11ef-aca7-1aa268f50191'),
('fefbc09a-5490-11ef-b112-1aa268f50191', '841412', '69c9ce49-579b-11ef-aca7-1aa268f50191');





INSERT INTO `user` (`id`, `userId`, `fullname`, `dateOfBirth`, `placeOfBirth`, `phone`, `email`, `isStudent`, `class`, `stillStudy`, `firstAcademicYear`, `lastAcademicYear`, `isActive`, `createDate`, `lastModifyDate`, `accountId`, `createUserId`, `lastModifyUserId`, `facultyId`, `majorId`) VALUES
('0ad0941f-579e-11ef-aca7-1aa268f50191', 'admin', 'admin', '2000-01-01 00:00:00', 'ho chi minh city', '', 'admin@sgu.edu.vn', 0, NULL, NULL, NULL, NULL, 1, '2024-04-08 00:00:00.000000', '2024-08-04 17:49:55.504687', '032646b8-5249-11ef-89f2-1aa268f50191', NULL, NULL, NULL, NULL);
INSERT INTO `user` (`id`, `userId`, `fullname`, `dateOfBirth`, `placeOfBirth`, `phone`, `email`, `isStudent`, `class`, `stillStudy`, `firstAcademicYear`, `lastAcademicYear`, `isActive`, `createDate`, `lastModifyDate`, `accountId`, `createUserId`, `lastModifyUserId`, `facultyId`, `majorId`) VALUES
('1eefe473-579e-11ef-aca7-1aa268f50191', '3120410003', 'Lê Thanh Hải', '2002-08-03 00:00:00', 'ho chi minh city', '0932143604', 'lethanhhai586@gmail.com', 1, 'DCT1202', 1, 2020, 2025, 1, '2024-07-08 00:00:00.000000', '2024-08-07 17:27:38.082437', '03266b97-5249-11ef-89f2-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', 'DCT', 'KTPM');
INSERT INTO `user` (`id`, `userId`, `fullname`, `dateOfBirth`, `placeOfBirth`, `phone`, `email`, `isStudent`, `class`, `stillStudy`, `firstAcademicYear`, `lastAcademicYear`, `isActive`, `createDate`, `lastModifyDate`, `accountId`, `createUserId`, `lastModifyUserId`, `facultyId`, `majorId`) VALUES
('1ef2d077-579e-11ef-aca7-1aa268f50191', '3120410521', 'Thuỷ Ngọc Mai Thy', '2002-10-13 00:00:00', 'ho chi minh city', '0123456789', 'thuyngocmaithyy@gmail.com', 1, 'DCT1202', 1, 2020, 2025, 1, '2024-07-08 00:00:00.000000', '2024-08-07 17:27:38.096829', '0326c478-5249-11ef-89f2-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', 'DCT', 'KTPM');
INSERT INTO `user` (`id`, `userId`, `fullname`, `dateOfBirth`, `placeOfBirth`, `phone`, `email`, `isStudent`, `class`, `stillStudy`, `firstAcademicYear`, `lastAcademicYear`, `isActive`, `createDate`, `lastModifyDate`, `accountId`, `createUserId`, `lastModifyUserId`, `facultyId`, `majorId`) VALUES
('1ef2e1eb-579e-11ef-aca7-1aa268f50191', '3120410115', 'Lý Thành Đạt', '2002-10-01 00:00:00', 'ho chi minh city', '01234567889', 'dayly03120@gmail.com', 1, 'DCT1205', 1, 2020, 2025, 1, '2024-07-08 00:00:00.000000', '2024-08-07 17:27:38.114492', '3abfe00f-5475-11ef-929d-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', 'DCT', 'KTPM'),
('1ef2e578-579e-11ef-aca7-1aa268f50191', '3120410103', 'Nguyễn Hải Dương', '2002-10-01 00:00:00', 'ho chi minh city', '01234567889', 'nguyenhaiduong9102@gmail.com', 1, 'DCT1205', 1, 2020, 2025, 1, '2024-07-08 00:00:00.000000', '2024-08-07 17:27:38.123067', '4b4c5532-5475-11ef-929d-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', '0ad0941f-579e-11ef-aca7-1aa268f50191', 'DCT', 'KTPM');


/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;