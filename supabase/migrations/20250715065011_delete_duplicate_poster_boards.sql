DO $$
DECLARE
    hamaton_count INTEGER;
    sapporo_count INTEGER;
    hamaton_activities INTEGER;
    sapporo_activities INTEGER;
    hamaton_history INTEGER;
    sapporo_history INTEGER;
BEGIN
    SELECT COUNT(*) INTO hamaton_count
    FROM poster_boards 
    WHERE prefecture = '北海道' 
      AND file_name = '浜頓別町（旧ファイル名：枝幸町）_normalized.csv';
    
    SELECT COUNT(*) INTO sapporo_count
    FROM poster_boards 
    WHERE prefecture = '北海道' 
      AND file_name = '札幌市_normalized.csv' 
      AND created_at = '2025-07-01 12:36:20.994601 UTC';
    
    SELECT COUNT(*) INTO hamaton_activities
    FROM poster_activities pa 
    JOIN poster_boards pb ON pa.board_id = pb.id 
    WHERE pb.prefecture = '北海道' AND pb.file_name = '浜頓別町（旧ファイル名：枝幸町）_normalized.csv';
    
    SELECT COUNT(*) INTO hamaton_history
    FROM poster_board_status_history pbsh 
    JOIN poster_boards pb ON pbsh.board_id = pb.id 
    WHERE pb.prefecture = '北海道' AND pb.file_name = '浜頓別町（旧ファイル名：枝幸町）_normalized.csv';
    
    SELECT COUNT(*) INTO sapporo_activities
    FROM poster_activities pa 
    JOIN poster_boards pb ON pa.board_id = pb.id 
    WHERE pb.prefecture = '北海道' AND pb.file_name = '札幌市_normalized.csv' AND pb.created_at = '2025-07-01 12:36:20.994601 UTC';
    
    SELECT COUNT(*) INTO sapporo_history
    FROM poster_board_status_history pbsh 
    JOIN poster_boards pb ON pbsh.board_id = pb.id 
    WHERE pb.prefecture = '北海道' AND pb.file_name = '札幌市_normalized.csv' AND pb.created_at = '2025-07-01 12:36:20.994601 UTC';
    
    RAISE NOTICE '=== Deletion Summary ===';
    RAISE NOTICE '北海道 浜頓別町（旧ファイル名：枝幸町） records to be deleted: %', hamaton_count;
    RAISE NOTICE '北海道 札幌市 (2025-07-01 12:36:20.994601 UTC) records to be deleted: %', sapporo_count;
    RAISE NOTICE 'Related poster_activities to be cascade deleted (浜頓別町): %', hamaton_activities;
    RAISE NOTICE 'Related poster_activities to be cascade deleted (札幌市): %', sapporo_activities;
    RAISE NOTICE 'Related poster_board_status_history to be cascade deleted (浜頓別町): %', hamaton_history;
    RAISE NOTICE 'Related poster_board_status_history to be cascade deleted (札幌市): %', sapporo_history;
END $$;

DELETE FROM poster_boards 
WHERE prefecture = '北海道' 
  AND file_name = '浜頓別町（旧ファイル名：枝幸町）_normalized.csv';

DELETE FROM poster_boards 
WHERE prefecture = '北海道' 
  AND file_name = '札幌市_normalized.csv' 
  AND created_at = '2025-07-01 12:36:20.994601 UTC';

DO $$
DECLARE
    hamaton_remaining INTEGER;
    sapporo_remaining INTEGER;
BEGIN
    SELECT COUNT(*) INTO hamaton_remaining
    FROM poster_boards 
    WHERE prefecture = '北海道' 
      AND file_name = '浜頓別町（旧ファイル名：枝幸町）_normalized.csv';
    
    SELECT COUNT(*) INTO sapporo_remaining
    FROM poster_boards 
    WHERE prefecture = '北海道' 
      AND file_name = '札幌市_normalized.csv' 
      AND created_at = '2025-07-01 12:36:20.994601 UTC';
    
    RAISE NOTICE '=== Verification Results ===';
    RAISE NOTICE 'Remaining 北海道 浜頓別町（旧ファイル名：枝幸町） records: %', hamaton_remaining;
    RAISE NOTICE 'Remaining 北海道 札幌市 (2025-07-01 12:36:20.994601 UTC) records: %', sapporo_remaining;
    
    IF hamaton_remaining > 0 THEN
        RAISE EXCEPTION 'Deletion failed for 北海道浜頓別町: % records still exist', hamaton_remaining;
    END IF;
    
    IF sapporo_remaining > 0 THEN
        RAISE EXCEPTION 'Deletion failed for 北海道札幌市: % records still exist', sapporo_remaining;
    END IF;
    
    RAISE NOTICE 'All deletions completed successfully';
END $$;
