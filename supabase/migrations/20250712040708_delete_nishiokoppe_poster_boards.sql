



DO $$
DECLARE
    hokkaido_count INTEGER;
    nagano_count INTEGER;
    hokkaido_activities INTEGER;
    nagano_activities INTEGER;
    hokkaido_history INTEGER;
    nagano_history INTEGER;
BEGIN
    SELECT COUNT(*) INTO hokkaido_count
    FROM poster_boards 
    WHERE prefecture = '北海道' 
      AND file_name = '西興部町_normalized.csv';
    
    SELECT COUNT(*) INTO nagano_count
    FROM poster_boards 
    WHERE prefecture = '長野県' 
      AND file_name = '長野県_筑北村_normalized.csv';
    
    SELECT COUNT(*) INTO hokkaido_activities
    FROM poster_activities pa 
    JOIN poster_boards pb ON pa.board_id = pb.id 
    WHERE pb.prefecture = '北海道' AND pb.file_name = '西興部町_normalized.csv';
    
    SELECT COUNT(*) INTO hokkaido_history
    FROM poster_board_status_history pbsh 
    JOIN poster_boards pb ON pbsh.board_id = pb.id 
    WHERE pb.prefecture = '北海道' AND pb.file_name = '西興部町_normalized.csv';
    
    SELECT COUNT(*) INTO nagano_activities
    FROM poster_activities pa 
    JOIN poster_boards pb ON pa.board_id = pb.id 
    WHERE pb.prefecture = '長野県' AND pb.file_name = '長野県_筑北村_normalized.csv';
    
    SELECT COUNT(*) INTO nagano_history
    FROM poster_board_status_history pbsh 
    JOIN poster_boards pb ON pbsh.board_id = pb.id 
    WHERE pb.prefecture = '長野県' AND pb.file_name = '長野県_筑北村_normalized.csv';
    
    RAISE NOTICE '=== Deletion Summary ===';
    RAISE NOTICE '北海道 西興部町 records to be deleted: %', hokkaido_count;
    RAISE NOTICE '長野県 筑北村 records to be deleted: %', nagano_count;
    RAISE NOTICE 'Related poster_activities to be cascade deleted (北海道): %', hokkaido_activities;
    RAISE NOTICE 'Related poster_activities to be cascade deleted (長野県): %', nagano_activities;
    RAISE NOTICE 'Related poster_board_status_history to be cascade deleted (北海道): %', hokkaido_history;
    RAISE NOTICE 'Related poster_board_status_history to be cascade deleted (長野県): %', nagano_history;
END $$;

DELETE FROM poster_boards 
WHERE prefecture = '北海道' 
  AND file_name = '西興部町_normalized.csv';

DELETE FROM poster_boards 
WHERE prefecture = '長野県' 
  AND file_name = '長野県_筑北村_normalized.csv';

DO $$
DECLARE
    hokkaido_remaining INTEGER;
    nagano_remaining INTEGER;
BEGIN
    SELECT COUNT(*) INTO hokkaido_remaining
    FROM poster_boards 
    WHERE prefecture = '北海道' 
      AND file_name = '西興部町_normalized.csv';
    
    SELECT COUNT(*) INTO nagano_remaining
    FROM poster_boards 
    WHERE prefecture = '長野県' 
      AND file_name = '長野県_筑北村_normalized.csv';
    
    RAISE NOTICE '=== Verification Results ===';
    RAISE NOTICE 'Remaining 北海道 西興部町 records: %', hokkaido_remaining;
    RAISE NOTICE 'Remaining 長野県 筑北村 records: %', nagano_remaining;
    
    IF hokkaido_remaining > 0 THEN
        RAISE EXCEPTION 'Deletion failed for 北海道: % records still exist', hokkaido_remaining;
    END IF;
    
    IF nagano_remaining > 0 THEN
        RAISE EXCEPTION 'Deletion failed for 長野県: % records still exist', nagano_remaining;
    END IF;
    
    RAISE NOTICE 'All deletions completed successfully';
END $$;
