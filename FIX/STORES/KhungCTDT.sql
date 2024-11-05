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
		            FROM subject_studyFrameComp_major ssm
		            LEFT JOIN subject sj ON sj.subjectId = ssm.subjectId
		            WHERE ssm.studyFrameComponentId = sf_comp.frameComponentId
		        ),
		        JSON_ARRAY()
		    ) AS subjectInfo
		FROM frameStructure frame
		LEFT JOIN studyFrame_component sf_comp ON frame.studyFrameComponentId = sf_comp.frameComponentId
		LEFT JOIN subject_studyFrameComp_major ssm ON ssm.studyFrameComponentId = sf_comp.frameComponentId  -- Kết nối với bảng gộp subject_studyFrameComp_major
		LEFT JOIN subject sj ON sj.subjectId = ssm.subjectId  -- Kết nối với bảng môn học
		LEFT JOIN major m ON m.majorId = ssm.majorId  -- Kết nối với bảng chuyên ngành từ bảng gộp
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
		            FROM subject_studyFrameComp_major ssm
		            LEFT JOIN subject sj ON sj.subjectId = ssm.subjectId
		            WHERE ssm.studyFrameComponentId = sf_comp.frameComponentId
		        ),
		        JSON_ARRAY()
		    ) AS subjectInfo
		FROM frameStructure frame
		LEFT JOIN studyFrame_component sf_comp ON frame.studyFrameComponentId = sf_comp.frameComponentId
		LEFT JOIN subject_studyFrameComp_major ssm ON ssm.studyFrameComponentId = sf_comp.frameComponentId  -- Kết nối với bảng gộp subject_studyFrameComp_major
		LEFT JOIN subject sj ON sj.subjectId = ssm.subjectId  -- Kết nối với bảng môn học
		LEFT JOIN major m ON m.majorId = ssm.majorId  -- Kết nối với bảng chuyên ngành từ bảng gộp
		WHERE frame.studyFrameId = p_studyFrameId
		AND sf_comp.frameComponentId <> 'CHUYENNGANH'    
		GROUP BY sf_comp.id, sf_comp.frameComponentId, sf_comp.frameComponentName, sf_comp.creditHour, frame.studyFrameComponentParentId, frame.orderNo

    ) AS combined_results
    ORDER BY combined_results.orderNo; -- Sắp xếp kết quả theo thứ tự
END