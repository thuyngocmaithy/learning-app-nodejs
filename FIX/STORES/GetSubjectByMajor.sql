CREATE DEFINER=`maithy`@`%` PROCEDURE `GetSubjectByMajor`(IN p_majorId VARCHAR(10))
BEGIN
    SELECT * 
    FROM (
        -- Select frames with frameId 'CHUYENNGANH' and filter by majorId
        SELECT 
            sf.id,
            sf.frameId, 
            sf.frameName, 
            sf.creditHour,
            sf.parentFrameId,
            sf.orderNo,
            m.majorName,
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
        FROM study_frame sf
        LEFT JOIN subject sj ON sj.frameId = sf.id
        LEFT JOIN major m ON m.majorId = sj.majorId
        WHERE sf.frameId LIKE 'CN_%'
          AND sj.majorId = p_majorId
        GROUP BY sf.id, sf.frameId, sf.frameName, sf.creditHour, sf.parentFrameId, sf.orderNo, m.majorName
        
        UNION ALL
        
        -- Select frames with frameId other than those starting with 'CN_'
        SELECT 
            sf.id,
            sf.frameId, 
            sf.frameName, 
            sf.creditHour,
            sf.parentFrameId,
            sf.orderNo,
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
        FROM study_frame sf
        LEFT JOIN subject sj ON sj.frameId = sf.id
        WHERE sf.frameId NOT LIKE 'CN_%'
        GROUP BY sf.id, sf.frameId, sf.frameName, sf.creditHour, sf.parentFrameId, sf.orderNo
    ) AS combined_results
    ORDER BY combined_results.orderNo;
END