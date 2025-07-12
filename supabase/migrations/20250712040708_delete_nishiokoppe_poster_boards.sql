
DO $$
DECLARE
    record_count INTEGER;
    related_activities INTEGER;
    related_history INTEGER;
BEGIN
    SELECT COUNT(*) INTO record_count
    FROM poster_boards 
    WHERE prefecture = '北海道' 
      AND file_name = '西興部町_normalized.csv';
    
    SELECT COUNT(*) INTO related_activities
    FROM poster_activities pa 
    JOIN poster_boards pb ON pa.board_id = pb.id 
    WHERE pb.prefecture = '北海道' AND pb.file_name = '西興部町_normalized.csv';
    
    SELECT COUNT(*) INTO related_history
    FROM poster_board_status_history pbsh 
    JOIN poster_boards pb ON pbsh.board_id = pb.id 
    WHERE pb.prefecture = '北海道' AND pb.file_name = '西興部町_normalized.csv';
    
    RAISE NOTICE 'Records to be deleted: %', record_count;
    RAISE NOTICE 'Related poster_activities to be cascade deleted: %', related_activities;
    RAISE NOTICE 'Related poster_board_status_history to be cascade deleted: %', related_history;
END $$;

DELETE FROM poster_boards 
WHERE prefecture = '北海道' 
  AND file_name = '西興部町_normalized.csv';

DO $$
DECLARE
    remaining_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO remaining_count
    FROM poster_boards 
    WHERE prefecture = '北海道' 
      AND file_name = '西興部町_normalized.csv';
    
    RAISE NOTICE 'Remaining records after deletion: %', remaining_count;
    
    IF remaining_count > 0 THEN
        RAISE EXCEPTION 'Deletion failed: % records still exist', remaining_count;
    ELSE
        RAISE NOTICE 'Deletion completed successfully';
    END IF;
END $$;
