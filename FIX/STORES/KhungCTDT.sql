CREATE DEFINER=`maithy`@`%` PROCEDURE `KhungCTDT`()
BEGIN
    SELECT * 
    FROM (
        -- Chọn các khung với frames chứa 'CHUYENNGANH'
       SELECT 
		    sf.id,
		    sf.frameId, 
		    sf.frameName, 
		    sf.creditHour,
		    sf.parentFrameId,
		    sf.orderNo,
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
		            FROM subject_studyFrame ssf
		            LEFT JOIN subject sj ON sj.subjectId = ssf.subjectId
		            WHERE ssf.frameId = sf.frameId
		        ),
		        JSON_ARRAY()
		    ) AS subjectInfo
		FROM study_frame sf
		LEFT JOIN subject_studyFrame ssf ON ssf.frameId = sf.frameId  -- Kết nối với bảng trung gian subject_studyFrame
		LEFT JOIN subject sj ON sj.subjectId = ssf.subjectId  -- Kết nối với bảng môn học
		LEFT JOIN subject_major sm ON sm.subjectId = sj.subjectId  -- Kết nối với bảng trung gian subject_major
		LEFT JOIN major m ON m.majorId = sm.majorId  -- Kết nối với bảng chuyên ngành
		WHERE sf.frameId = 'CHUYENNGANH'    
		GROUP BY sf.id, sf.frameId, sf.frameName, sf.creditHour, sf.parentFrameId, sf.orderNo


        
        UNION ALL
        
        -- Chọn các khung không có môn học bắt buộc
        SELECT 
		    sf.id,
		    sf.frameId, 
		    sf.frameName, 
		    sf.creditHour,
		    sf.parentFrameId,
		    sf.orderNo,
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
		            FROM subject_studyFrame ssf
		            LEFT JOIN subject sj ON sj.subjectId = ssf.subjectId
		            WHERE ssf.frameId = sf.frameId
		        ),
		        JSON_ARRAY()
		    ) AS subjectInfo
		FROM study_frame sf
		LEFT JOIN subject_studyFrame ssf ON ssf.frameId = sf.frameId  -- Kết nối với bảng trung gian subject_studyFrame
		LEFT JOIN subject sj ON sj.subjectId = ssf.subjectId  -- Kết nối với bảng môn học
		LEFT JOIN subject_major sm ON sm.subjectId = sj.subjectId  -- Kết nối với bảng trung gian subject_major
		LEFT JOIN major m ON m.majorId = sm.majorId  -- Kết nối với bảng chuyên ngành
		WHERE sf.frameId <> 'CHUYENNGANH'    
		GROUP BY sf.id, sf.frameId, sf.frameName, sf.creditHour, sf.parentFrameId, sf.orderNo

    ) AS combined_results
    ORDER BY combined_results.orderNo; -- Sắp xếp kết quả theo thứ tự
END