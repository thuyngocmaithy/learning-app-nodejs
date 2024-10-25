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
		    sf_comp.parentFrameComponentId,
		    sf_comp.orderNo,
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
		            FROM subject_studyFrameComponent ssf
		            LEFT JOIN subject sj ON sj.subjectId = ssf.subjectId
		            WHERE ssf.frameComponentId = sf_comp.frameComponentId
		        ),
		        JSON_ARRAY()
		    ) AS subjectInfo
		FROM studyFrame_component sf_comp
		LEFT JOIN subject_studyFrameComponent ssf ON ssf.frameComponentId = sf_comp.frameComponentId  -- Kết nối với bảng trung gian subject_studyFrameComponent
		LEFT JOIN subject sj ON sj.subjectId = ssf.subjectId  -- Kết nối với bảng môn học
		LEFT JOIN subject_major sm ON sm.subjectId = sj.subjectId  -- Kết nối với bảng trung gian subject_major
		LEFT JOIN major m ON m.majorId = sm.majorId  -- Kết nối với bảng chuyên ngành
		WHERE sf_comp.studyFrameId = p_studyFrameId
		AND sf_comp.frameComponentId = 'CHUYENNGANH'    
		GROUP BY sf_comp.id, sf_comp.frameComponentId, sf_comp.frameComponentName, sf_comp.creditHour, sf_comp.parentFrameComponentId, sf_comp.orderNo


        
        UNION ALL
        
        -- Chọn các khung không có môn học bắt buộc
        SELECT 
		    sf_comp.id,
		    sf_comp.frameComponentId, 
		    sf_comp.frameComponentName, 
		    sf_comp.creditHour,
		    sf_comp.parentFrameComponentId,
		    sf_comp.orderNo,
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
		            FROM subject_studyFrameComponent ssf
		            LEFT JOIN subject sj ON sj.subjectId = ssf.subjectId
		            WHERE ssf.frameComponentId = sf_comp.frameComponentId
		        ),
		        JSON_ARRAY()
		    ) AS subjectInfo
		FROM studyFrame_component sf_comp
		LEFT JOIN subject_studyFrameComponent ssf ON ssf.frameComponentId = sf_comp.frameComponentId  -- Kết nối với bảng trung gian subject_studyFrameComponent
		LEFT JOIN subject sj ON sj.subjectId = ssf.subjectId  -- Kết nối với bảng môn học
		LEFT JOIN subject_major sm ON sm.subjectId = sj.subjectId  -- Kết nối với bảng trung gian subject_major
		LEFT JOIN major m ON m.majorId = sm.majorId  -- Kết nối với bảng chuyên ngành
		WHERE sf_comp.studyFrameId = p_studyFrameId
		AND sf_comp.frameComponentId <> 'CHUYENNGANH'    
		GROUP BY sf_comp.id, sf_comp.frameComponentId, sf_comp.frameComponentName, sf_comp.creditHour, sf_comp.parentFrameComponentId, sf_comp.orderNo

    ) AS combined_results
    ORDER BY combined_results.orderNo; -- Sắp xếp kết quả theo thứ tự
END