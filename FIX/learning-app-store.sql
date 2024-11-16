/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

CREATE DEFINER=`maithy`@`%` PROCEDURE `GetFeatureByStructure`()
BEGIN
    -- Khai báo các biến để lưu kết quả của con trỏ
    DECLARE v_parentFeatureId VARCHAR(25);
    DECLARE v_featureId VARCHAR(25);
    DECLARE v_featureName VARCHAR(255);
    DECLARE v_icon VARCHAR(255);
    DECLARE v_url VARCHAR(255);
    
    DECLARE done INT DEFAULT 0;

    -- Khai báo con trỏ để duyệt qua kết quả của SELECT
    DECLARE feature_cursor CURSOR FOR 
    SELECT DISTINCT f.parentFeatureId, f2.featureId, f2.featureName, f2.icon, f2.url
    FROM feature f
    LEFT JOIN feature f2 ON f.parentFeatureId = f2.featureId
    WHERE f.parentFeatureId IS NOT NULL;

    -- Khai báo handler để xử lý khi không còn kết quả trong con trỏ
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

	DROP TABLE IF EXISTS TempResults;
    -- Tạo bảng tạm thời để lưu trữ kết quả
    CREATE TEMPORARY TABLE TempResults (
        parentFeatureId JSON,
        listFeature JSON
    );

    -- Mở con trỏ
    OPEN feature_cursor;

    -- Vòng lặp để duyệt qua các dòng kết quả của con trỏ
    read_loop: LOOP
        FETCH feature_cursor INTO v_parentFeatureId, v_featureId, v_featureName, v_icon, v_url;
        IF done THEN
            LEAVE read_loop;
        END IF;

        -- Thực hiện truy vấn và chèn kết quả vào bảng tạm thời
        INSERT INTO TempResults (parentFeatureId, listFeature)
        SELECT 
             JSON_OBJECT(
                        'parentFeatureId', v_parentFeatureId,
                        'featureId', v_featureId,
                        'featureName', v_featureName,
                        'icon', v_icon,
                        'url', v_url
                    ) AS parentFeature,
            IFNULL(
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'featureId', f.featureId,
                        'featureName', f.featureName,
                        'url', f.url,
                        'keyRoute', f.keyRoute,
	                	'parentFeature', f.parentFeatureId,
	                	'icon', f.icon
                    )
                ),
                JSON_ARRAY()
            ) AS listFeature
        FROM feature f
        WHERE f.parentFeatureId = v_parentFeatureId
        GROUP BY f.parentFeatureId;
    END LOOP;

    -- Đóng con trỏ
    CLOSE feature_cursor;

    -- Trả về toàn bộ kết quả từ bảng tạm thời
    SELECT * FROM
	(
	    SELECT * FROM TempResults
	    UNION ALL
	    SELECT NULL as parentFeatureId,
	    IFNULL(
	        JSON_ARRAYAGG(
	            JSON_OBJECT(
	                'featureId', f.featureId,
	                'featureName', f.featureName,
	                'url', f.url,
	                'keyRoute', f.keyRoute,
	                'parentFeature', f.parentFeatureId,
	                'icon', f.icon
	            )
	        ),
	        JSON_ARRAY()
	    ) AS listFeature
	            
	    FROM feature f where f.parentFeatureId IS NULL
	    AND f.featureId NOT IN (
	        SELECT DISTINCT parentFeatureId
		    FROM feature f
		    WHERE f.parentFeatureId IS NOT NULL
		)
	) AS result
	ORDER BY JSON_EXTRACT(parentFeatureId, '$.featureId') ;

    -- Xóa bảng tạm thời sau khi sử dụng
    DROP TEMPORARY TABLE TempResults;

END;

CREATE DEFINER=`maithy`@`%` PROCEDURE `GetMenuUser`(
    IN permissionId VARCHAR(25)
)
BEGIN
    -- Khai báo các biến để lưu kết quả của con trỏ
    DECLARE v_parentFeatureId VARCHAR(25);
    DECLARE v_featureId VARCHAR(25);
    DECLARE v_featureName VARCHAR(255);
    DECLARE v_icon VARCHAR(255);
    DECLARE v_url VARCHAR(255);
    DECLARE v_parentFeatureIds JSON DEFAULT JSON_ARRAY();
    
    DECLARE done INT DEFAULT 0;
    DECLARE has_rows INT DEFAULT 0;

    -- Kiểm tra có parent feature từ ds feature theo quyền không
    SELECT COUNT(*)
    INTO has_rows
    FROM (
        SELECT DISTINCT F1.parentFeatureId
        FROM permission_feature PF
        LEFT JOIN feature F1 ON PF.featureId = F1.featureId
        WHERE PF.permissionId = permissionId
        AND F1.parentFeatureId IS NOT NULL
    ) AS temp_check;

    -- Nếu không có => lấy mảng feature bình thường
    IF has_rows = 0 THEN
        BEGIN
            SELECT F1.*
            FROM permission_feature PF
            LEFT JOIN feature F1 ON PF.featureId = F1.featureId
            WHERE PF.permissionId = permissionId;                     
        END;
    ELSE
        BEGIN
            -- Khai báo con trỏ để duyệt qua kết quả của SELECT
            DECLARE feature_cursor CURSOR FOR 
            SELECT DISTINCT F1.parentFeatureId, F2.featureId, F2.featureName, F2.icon, F2.url
            FROM permission_feature PF
            LEFT JOIN feature F1 ON PF.featureId = F1.featureId
            LEFT JOIN feature F2 ON F1.parentFeatureId = F2.featureId
            WHERE PF.permissionId = permissionId
            GROUP BY F1.parentFeatureId;

            -- Khai báo handler để xử lý khi không còn kết quả trong con trỏ
            DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;
			DROP TEMPORARY TABLE IF EXISTS TempResultsA;
            DROP TEMPORARY TABLE IF EXISTS TempResultsB;
            DROP TEMPORARY TABLE IF EXISTS TempParentFeatureIds;
            -- Tạo bảng tạm thời để lưu trữ kết quả
            CREATE TEMPORARY TABLE TempResultsA (
                parentFeatureId JSON,
                listFeature JSON
            );
            CREATE TEMPORARY TABLE TempResultsB (
                parentFeatureId JSON,
                listFeature JSON
            );
            
            -- Tạo bảng tạm để lưu trữ các parentFeatureId đã gặp
			CREATE TEMPORARY TABLE TempParentFeatureIds (
			    parentFeatureId VARCHAR(25) PRIMARY KEY
			);

            -- Mở con trỏ
            OPEN feature_cursor;

            -- Vòng lặp để duyệt qua các dòng kết quả của con trỏ
            read_loop: LOOP
                FETCH feature_cursor INTO v_parentFeatureId, v_featureId, v_featureName, v_icon, v_url;
                IF done THEN
                    LEAVE read_loop;
                END IF;

                -- Thực hiện truy vấn và chèn kết quả vào bảng tạm thời
                INSERT INTO TempResultsA (parentFeatureId, listFeature)
                SELECT 
                    JSON_OBJECT(
                        'parentFeatureId', v_parentFeatureId,
                        'featureId', v_featureId,
                        'featureName', v_featureName,
                        'icon', v_icon,
                        'url', v_url
                    ) AS parentFeature,
                    IFNULL(
                        JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'featureId', f.featureId,
                                'featureName', f.featureName,
                                'url', f.url,
                                'keyRoute', f.keyRoute,
                                'parentFeature', f.parentFeatureId,
                                'icon', f.icon
                            )
                        ),
                        JSON_ARRAY()
                    ) AS listFeature
                FROM permission_feature pf
                LEFT JOIN feature f ON f.featureId = pf.featureId
                WHERE f.parentFeatureId = v_parentFeatureId      
                AND pf.permissionId = permissionId
                GROUP BY f.parentFeatureId;
                
                -- Cập nhật bảng tạm với parentFeatureId hiện tại
			    INSERT IGNORE INTO TempParentFeatureIds (parentFeatureId)
			    VALUES (v_parentFeatureId); 
               
	            
            END LOOP;
            
            
            -- Chèn dữ liệu vào TempResultsB với điều kiện lọc dựa trên bảng tạm
			INSERT INTO TempResultsB (parentFeatureId, listFeature)
			SELECT NULL AS parentFeature,
			    IFNULL(
			        JSON_ARRAYAGG(
			            JSON_OBJECT(
			                'featureId', F1.featureId,
			                'featureName', F1.featureName,
			                'url', F1.url,
			                'keyRoute', F1.keyRoute,
			                'parentFeature', F1.parentFeatureId,
			                'icon', F1.icon
			            )
			        ),
			        JSON_ARRAY()
			    ) AS listFeature
			FROM permission_feature PF
			LEFT JOIN feature F1 ON PF.featureId = F1.featureId
			WHERE PF.permissionId = permissionId
			AND (F1.parentFeatureId IS NULL OR NOT EXISTS (
			    SELECT 1
			    FROM TempParentFeatureIds tpf
			    WHERE tpf.parentFeatureId = F1.parentFeatureId
			))
			GROUP BY F1.parentFeatureId;
					
			SELECT DISTINCT parentFeatureId, listFeature
			FROM (
			    SELECT parentFeatureId, listFeature FROM TempResultsA
			    UNION ALL
			    SELECT parentFeatureId, listFeature FROM TempResultsB
			) AS CombinedResults
			ORDER BY parentFeatureId;

			-- Xóa bảng tạm sau khi sử dụng xong
			DROP TEMPORARY TABLE IF EXISTS TempResultsA;
            DROP TEMPORARY TABLE IF EXISTS TempResultsB;
			DROP TEMPORARY TABLE IF EXISTS TempParentFeatureIds;			        
            
                    
            -- Đóng con trỏ
            CLOSE feature_cursor;
        END;
    END IF;
END;

CREATE DEFINER=`maithy`@`%` PROCEDURE `GetStudentScoreByFrame`(IN StudentId VARCHAR(50))
BEGIN
    WITH RecursiveCTE AS (
        -- Get root components (no parent)
        SELECT 
            fc.id,
            fc.frameComponentId,
            fc.frameComponentName,
            fc.parentFrameComponent_id AS parentId,
            fc.creditHour,
            fc.orderNo,
            fc.description,
            0 AS Level
        FROM studyFrame_component fc
        WHERE fc.parentFrameComponent_id IS NULL

        UNION ALL

        -- Get child components
        SELECT 
            child.id,
            child.frameComponentId,
            child.frameComponentName,
            child.parentFrameComponent_id,
            child.creditHour,
            child.orderNo,
            child.description,
            parent.Level + 1
        FROM studyFrame_component child
        INNER JOIN RecursiveCTE parent ON child.parentFrameComponent_id = parent.id
    )

    SELECT 
        rc.id AS frameComponentId,
        rc.frameComponentName,
        rc.creditHour AS frameCreditHour,
        rc.Level,
        rc.parentId,
        rc.description,
        (
            SELECT 
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'subjectId', s.subjectId,
                        'subjectName', s.subjectName,
                        'creditHour', s.creditHour,
                        'finalScoreLetter', COALESCE(sc.finalScoreLetter, ''),
                        'semesterId', sc.semester_semesterId,
                        'isCompulsory', s.isCompulsory
                    )
                )
            FROM subject s
            LEFT JOIN score sc ON sc.subject_subjectId = s.subjectId 
                              AND sc.student_userId = @StudentId
            WHERE s.studyFrame_component_id = rc.id
        ) as subjectInfo
    FROM RecursiveCTE rc
    ORDER BY 
        rc.Level,
        rc.orderNo;
END;

CREATE DEFINER=`maithy`@`%` PROCEDURE `GetSubjectByMajor`(IN p_majorId VARCHAR(10), IN p_studyFrameId VARCHAR(255))
BEGIN
    SELECT * 
    FROM (
        -- Select frames with frameComponentId 'CHUYENNGANH' and filter by majorId
        SELECT 
            sf.id,
            sf.frameComponentId, 
            sf.frameComponentName, 
            sf.creditHour,
            frame.studyFrameComponentParentId,
            frame.orderNo,
            GROUP_CONCAT(DISTINCT m.majorName) AS majorNames,  -- Gộp tên chuyên ngành nếu có nhiều
            IFNULL(
                JSON_ARRAYAGG(
                    IF(
                        sj.subjectId IS NOT NULL,
                        JSON_OBJECT(
                            'subjectId', sj.subjectId,
                            'subjectName', sj.subjectName,
                            'isCompulsory', sj.isCompulsory,
                            'creditHour', sj.creditHour
                        ),
                        NULL
                    )
                ),
                JSON_ARRAY()
            ) AS subjectInfo
        FROM frameStructure frame
		LEFT JOIN studyFrame_component sf ON frame.studyFrameComponentId = sf.frameComponentId
        LEFT JOIN subject_studyFrameComp ss ON ss.studyFrameComponentId = sf.frameComponentId
        LEFT JOIN subject sj ON sj.subjectId = ss.subjectId
        LEFT JOIN major m ON m.majorId = sf.majorId
        WHERE frame.studyFrameId = p_studyFrameId
		AND sf.frameComponentId LIKE 'CN_%'
		AND sf.majorId = p_majorId
        GROUP BY sf.id, sf.frameComponentId, sf.frameComponentName, sf.creditHour, frame.studyFrameComponentParentId, frame.orderNo, m.majorName
        
        UNION ALL
        
        -- Select frames with frameComponentId other than those starting with 'CN_'
        SELECT 
            sf.id,
            sf.frameComponentId, 
            sf.frameComponentName, 
            sf.creditHour,
            frame.studyFrameComponentParentId,
            frame.orderNo,
            NULL as majorName,
            IFNULL(
                JSON_ARRAYAGG(
                    IF(
                        sj.subjectId IS NOT NULL,
                        JSON_OBJECT(
                            'subjectId', sj.subjectId,
                            'subjectName', sj.subjectName,
                            'isCompulsory', sj.isCompulsory,
                            'creditHour', sj.creditHour
                        ),
                        NULL
                    )
                ),
                JSON_ARRAY()
            ) AS subjectInfo
        FROM frameStructure frame
		LEFT JOIN studyFrame_component sf ON frame.studyFrameComponentId = sf.frameComponentId
        LEFT JOIN subject_studyFrameComp ss ON ss.studyFrameComponentId = sf.frameComponentId
        LEFT JOIN subject sj ON sj.subjectId = ss.subjectId
        WHERE frame.studyFrameId = p_studyFrameId
		AND sf.frameComponentId NOT LIKE 'CN_%'
        GROUP BY sf.id, sf.frameComponentId, sf.frameComponentName, sf.creditHour, frame.studyFrameComponentParentId, frame.orderNo
    ) AS combined_results
    ORDER BY combined_results.orderNo;
END;

CREATE DEFINER=`maithy`@`%` PROCEDURE `GetSubjectsByFaculty`(IN facultyId VARCHAR(25))
BEGIN
    SELECT DISTINCT s.*
    FROM subject s
    INNER JOIN subject_studyFrameComp ss ON s.subjectId = ss.subjectId
	INNER JOIN studyFrame_component sfc ON ss.studyFrameComponentId = sfc.frameComponentId
    INNER JOIN major m ON sfc.majorId = m.majorId
    INNER JOIN faculty f ON m.facultyId = f.facultyId
    WHERE f.facultyId = facultyId;
END;

CREATE DEFINER=`maithy`@`%` PROCEDURE `GetSubjectsWithDetails`()
BEGIN
    SELECT 
        s.subjectId,
        s.subjectName,
        s.creditHour,
        s.isCompulsory,
        sb.subjectId AS subjectBeforeId,
        se.subjectId AS subjectEqualId,
        -- Áp dụng GROUP_CONCAT để gom các giá trị lại
        GROUP_CONCAT(DISTINCT m.majorId) AS majorId, 
        GROUP_CONCAT(DISTINCT m.majorName) AS majorName,
        GROUP_CONCAT(DISTINCT f.facultyId) AS facultyId,
        GROUP_CONCAT(DISTINCT f.facultyName) AS facultyName,
        GROUP_CONCAT(DISTINCT sfc.frameComponentId) AS frameComponentId,
        GROUP_CONCAT(DISTINCT sfc.frameComponentName) AS frameComponentName,
        GROUP_CONCAT(DISTINCT sfc.description) AS description,
        s.createDate,
        s.createUserId,
        s.lastModifyDate,
        s.lastModifyUserId
    FROM subject s
    LEFT JOIN subject_studyFrameComp ss ON s.subjectId = ss.subjectId
    LEFT JOIN studyFrame_component sfc ON ss.studyFrameComponentId = sfc.frameComponentId
    LEFT JOIN major m ON sfc.majorId = m.majorId
    LEFT JOIN faculty f ON m.facultyId = f.facultyId
    LEFT JOIN subject sb ON s.subjectBefore = sb.subjectId
    LEFT JOIN subject se ON s.subjectEqualId = se.subjectId
    GROUP BY s.subjectId;
END;

CREATE DEFINER=`maithy`@`%` PROCEDURE `KhungCTDT`(IN p_studyFrameId VARCHAR(255))
BEGIN
    SELECT * 
    FROM (
        -- Chọn các khung với frames chứa 'CHUYENNGANH'
       SELECT 
		    sf_comp.id,
		    sf_comp.frameComponentId, 
		    sf_comp.frameComponentName, 
		    sf_comp.creditHour,
		    frame.studyFrameComponentParentId,
		    frame.orderNo,
		    GROUP_CONCAT(DISTINCT m.majorName) AS majorNames,  -- Gộp tên chuyên ngành nếu có nhiều
		    IFNULL(
		        (
		            SELECT 
		                JSON_ARRAYAGG(
		                    JSON_OBJECT(
		                        'subjectId', sj.subjectId,
		                        'subjectName', sj.subjectName,
		                        'isCompulsory', sj.isCompulsory,
		                        'creditHour', sj.creditHour
		                    )
		                )
		            FROM subject_studyFrameComp ss
		            LEFT JOIN subject sj ON sj.subjectId = ss.subjectId
		            WHERE ss.studyFrameComponentId = sf_comp.frameComponentId
		        ),
		        JSON_ARRAY()
		    ) AS subjectInfo
		FROM frameStructure frame
		LEFT JOIN studyFrame_component sf_comp ON frame.studyFrameComponentId = sf_comp.frameComponentId
		LEFT JOIN subject_studyFrameComp ss ON ss.studyFrameComponentId = sf_comp.frameComponentId  -- Kết nối với bảng gộp subject_studyFrameComp
		LEFT JOIN subject sj ON sj.subjectId = ss.subjectId  -- Kết nối với bảng môn học
		LEFT JOIN major m ON m.majorId = sf_comp.majorId  -- Kết nối với bảng chuyên ngành từ bảng gộp
		WHERE frame.studyFrameId = p_studyFrameId
		AND sf_comp.frameComponentId = 'CHUYENNGANH'    
		GROUP BY sf_comp.id, sf_comp.frameComponentId, sf_comp.frameComponentName, sf_comp.creditHour, frame.studyFrameComponentParentId, frame.orderNo


        
        UNION ALL
        
        -- Chọn các khung không có môn học bắt buộc
        SELECT 
		    sf_comp.id,
		    sf_comp.frameComponentId, 
		    sf_comp.frameComponentName, 
		    sf_comp.creditHour,
		    frame.studyFrameComponentParentId,
		    frame.orderNo,
		    GROUP_CONCAT(DISTINCT m.majorName) AS majorNames,  -- Gộp tên chuyên ngành nếu có nhiều
		    IFNULL(
		        (
		            SELECT 
		                JSON_ARRAYAGG(
		                    JSON_OBJECT(
		                        'subjectId', sj.subjectId,
		                        'subjectName', sj.subjectName,
		                        'isCompulsory', sj.isCompulsory,
		                        'creditHour', sj.creditHour
		                    )
		                )
		            FROM subject_studyFrameComp ss
		            LEFT JOIN subject sj ON sj.subjectId = ss.subjectId
		            WHERE ss.studyFrameComponentId = sf_comp.frameComponentId
		        ),
		        JSON_ARRAY()
		    ) AS subjectInfo
		FROM frameStructure frame
		LEFT JOIN studyFrame_component sf_comp ON frame.studyFrameComponentId = sf_comp.frameComponentId
		LEFT JOIN subject_studyFrameComp ss ON ss.studyFrameComponentId = sf_comp.frameComponentId  -- Kết nối với bảng gộp subject_studyFrameComp
		LEFT JOIN subject sj ON sj.subjectId = ss.subjectId  -- Kết nối với bảng môn học
		LEFT JOIN major m ON m.majorId = sf_comp.majorId  -- Kết nối với bảng chuyên ngành từ bảng gộp
		WHERE frame.studyFrameId = p_studyFrameId
		AND sf_comp.frameComponentId <> 'CHUYENNGANH'    
		GROUP BY sf_comp.id, sf_comp.frameComponentId, sf_comp.frameComponentName, sf_comp.creditHour, frame.studyFrameComponentParentId, frame.orderNo

    ) AS combined_results
    ORDER BY combined_results.orderNo; -- Sắp xếp kết quả theo thứ tự
END;

CREATE DEFINER=`maithy`@`%` PROCEDURE `SearchScores`(
    IN p_student_id VARCHAR(36),
    IN p_subject_id VARCHAR(25),
    IN p_semester_id VARCHAR(25),
    IN p_exam_score DECIMAL(5,2),
    IN p_test_score DECIMAL(5,2),
    IN p_final_score_10 DECIMAL(5,2),
    IN p_final_score_4 DECIMAL(5,2),
    IN p_final_score_letter VARCHAR(2),
    IN p_result BOOLEAN,
    IN p_academic_year INT,
    IN p_semester_name INT
)
BEGIN
    SELECT 
        s.id,
        s.examScore,
        s.testScore,
        s.finalScore10,
        s.finalScore4,
        s.finalScoreLetter,
        s.result,
        -- Subject information
        subj.subjectId,
        subj.subjectName,
        subj.creditHour,
        -- Student information
        u.userId AS studentId,
        u.fullName AS studentName,
        -- Semester information
        sem.semesterId,
        sem.semesterName,
        sem.academicYear
    FROM score s
    INNER JOIN subject subj ON s.subjectId = subj.subjectId
    INNER JOIN user u ON s.studentId = u.userId
    LEFT JOIN semester sem ON s.semesterId = sem.semesterId
    WHERE 
        -- Student filter
        (p_student_id IS NULL OR s.studentId = p_student_id)
        -- Subject filter
        AND (p_subject_id IS NULL OR s.subjectId = p_subject_id)
        -- Semester filter
        AND (p_semester_id IS NULL OR s.semesterId = p_semester_id)
        -- Exam score
        AND (p_exam_score IS NULL OR s.examScore = p_exam_score)
        -- Test score
        AND (p_test_score IS NULL OR s.testScore = p_test_score)
        -- Final score 10
        AND (p_final_score_10 IS NULL OR s.finalScore10 = p_final_score_10)
        -- Final score 4
        AND (p_final_score_4 IS NULL OR s.finalScore4 = p_final_score_4)
        -- Final score letter
        AND (p_final_score_letter IS NULL OR s.finalScoreLetter = p_final_score_letter)
        -- Result
        AND (p_result IS NULL OR s.result = p_result)
        -- Academic year
        AND (p_academic_year IS NULL OR sem.academicYear = p_academic_year)
        -- Semester name
        AND (p_semester_name IS NULL OR sem.semesterName = p_semester_name)
    ORDER BY 
        sem.academicYear DESC, 
        sem.semesterName DESC, 
        subj.subjectName ASC,
        u.fullName ASC;
END;











/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;