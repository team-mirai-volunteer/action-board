
--

DO $$
DECLARE
    kanagawa_aoba_count INTEGER;
    kanagawa_aoba_activities INTEGER;
    kanagawa_aoba_history INTEGER;
BEGIN
    SELECT COUNT(*) INTO kanagawa_aoba_count
    FROM poster_boards 
    WHERE prefecture = '神奈川県' 
      AND file_name = '青葉区_normalized.csv';
    
    SELECT COUNT(*) INTO kanagawa_aoba_activities
    FROM poster_activities pa 
    JOIN poster_boards pb ON pa.board_id = pb.id 
    WHERE pb.prefecture = '神奈川県' AND pb.file_name = '青葉区_normalized.csv';
    
    SELECT COUNT(*) INTO kanagawa_aoba_history
    FROM poster_board_status_history pbsh 
    JOIN poster_boards pb ON pbsh.board_id = pb.id 
    WHERE pb.prefecture = '神奈川県' AND pb.file_name = '青葉区_normalized.csv';
    
    RAISE NOTICE '=== Deletion Summary ===';
    RAISE NOTICE '神奈川県 青葉区 records to be deleted: %', kanagawa_aoba_count;
    RAISE NOTICE 'Related poster_activities to be cascade deleted (神奈川県青葉区): %', kanagawa_aoba_activities;
    RAISE NOTICE 'Related poster_board_status_history to be cascade deleted (神奈川県青葉区): %', kanagawa_aoba_history;
END $$;

DELETE FROM poster_boards 
WHERE prefecture = '神奈川県' 
  AND file_name = '青葉区_normalized.csv';

DO $$
DECLARE
    kanagawa_aoba_remaining INTEGER;
BEGIN
    SELECT COUNT(*) INTO kanagawa_aoba_remaining
    FROM poster_boards 
    WHERE prefecture = '神奈川県' 
      AND file_name = '青葉区_normalized.csv';
    
    RAISE NOTICE '=== Verification Results ===';
    RAISE NOTICE 'Remaining 神奈川県 青葉区 records: %', kanagawa_aoba_remaining;
    
    IF kanagawa_aoba_remaining > 0 THEN
        RAISE EXCEPTION 'Deletion failed for 神奈川県青葉区: % records still exist', kanagawa_aoba_remaining;
    END IF;
    
    RAISE NOTICE 'All deletions completed successfully';
END $$;
