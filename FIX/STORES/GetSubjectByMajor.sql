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
END