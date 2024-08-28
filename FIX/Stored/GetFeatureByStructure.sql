DELIMITER $$

-- Xóa stored procedure nếu nó đã tồn tại
DROP PROCEDURE IF EXISTS GetMenuUser$$

CREATE DEFINER=`maithy`@`%` PROCEDURE `GetFeatureByStructure`()
BEGIN
    -- Khai báo các biến để lưu kết quả của con trỏ
    DECLARE v_parentFeatureId VARCHAR(25);
    DECLARE v_featureId VARCHAR(25);
    DECLARE v_featureName VARCHAR(255);
    DECLARE v_icon VARCHAR(255);
    
    DECLARE done INT DEFAULT 0;

    -- Khai báo con trỏ để duyệt qua kết quả của SELECT
    DECLARE feature_cursor CURSOR FOR 
    SELECT DISTINCT f.parentFeatureId, f2.featureId, f2.featureName, f2.icon
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
        FETCH feature_cursor INTO v_parentFeatureId, v_featureId, v_featureName, v_icon;
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
                        'icon', v_icon
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

END$$

DELIMITER ;