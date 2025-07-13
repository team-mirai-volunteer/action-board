
--

DO $$
DECLARE
    hokkaido_count INTEGER;
    nagano_chikuhoku_count INTEGER;
    nagano_suwa_count INTEGER;
    kanagawa_aoba_count INTEGER;
    hokkaido_activities INTEGER;
    nagano_chikuhoku_activities INTEGER;
    nagano_suwa_activities INTEGER;
    kanagawa_aoba_activities INTEGER;
    hokkaido_history INTEGER;
    nagano_chikuhoku_history INTEGER;
    nagano_suwa_history INTEGER;
    kanagawa_aoba_history INTEGER;
BEGIN
    SELECT COUNT(*) INTO hokkaido_count
    FROM poster_boards 
    WHERE prefecture = '北海道' 
      AND file_name = '西興部町_normalized.csv';
    
    SELECT COUNT(*) INTO nagano_chikuhoku_count
    FROM poster_boards 
    WHERE prefecture = '長野県' 
      AND file_name = '長野県_筑北村_normalized.csv';
    
    SELECT COUNT(*) INTO nagano_suwa_count
    FROM poster_boards 
    WHERE prefecture = '長野県' 
      AND file_name = '諏訪市_投票所_normalized.csv';
    
    SELECT COUNT(*) INTO kanagawa_aoba_count
    FROM poster_boards 
    WHERE prefecture = '神奈川県' 
      AND file_name = '青葉区_normalized.csv';
    
    SELECT COUNT(*) INTO hokkaido_activities
    FROM poster_activities pa 
    JOIN poster_boards pb ON pa.board_id = pb.id 
    WHERE pb.prefecture = '北海道' AND pb.file_name = '西興部町_normalized.csv';
    
    SELECT COUNT(*) INTO hokkaido_history
    FROM poster_board_status_history pbsh 
    JOIN poster_boards pb ON pbsh.board_id = pb.id 
    WHERE pb.prefecture = '北海道' AND pb.file_name = '西興部町_normalized.csv';
    
    SELECT COUNT(*) INTO nagano_chikuhoku_activities
    FROM poster_activities pa 
    JOIN poster_boards pb ON pa.board_id = pb.id 
    WHERE pb.prefecture = '長野県' AND pb.file_name = '長野県_筑北村_normalized.csv';
    
    SELECT COUNT(*) INTO nagano_chikuhoku_history
    FROM poster_board_status_history pbsh 
    JOIN poster_boards pb ON pbsh.board_id = pb.id 
    WHERE pb.prefecture = '長野県' AND pb.file_name = '長野県_筑北村_normalized.csv';
    
    SELECT COUNT(*) INTO nagano_suwa_activities
    FROM poster_activities pa 
    JOIN poster_boards pb ON pa.board_id = pb.id 
    WHERE pb.prefecture = '長野県' AND pb.file_name = '諏訪市_投票所_normalized.csv';
    
    SELECT COUNT(*) INTO nagano_suwa_history
    FROM poster_board_status_history pbsh 
    JOIN poster_boards pb ON pbsh.board_id = pb.id 
    WHERE pb.prefecture = '長野県' AND pb.file_name = '諏訪市_投票所_normalized.csv';
    
    SELECT COUNT(*) INTO kanagawa_aoba_activities
    FROM poster_activities pa 
    JOIN poster_boards pb ON pa.board_id = pb.id 
    WHERE pb.prefecture = '神奈川県' AND pb.file_name = '青葉区_normalized.csv';
    
    SELECT COUNT(*) INTO kanagawa_aoba_history
    FROM poster_board_status_history pbsh 
    JOIN poster_boards pb ON pbsh.board_id = pb.id 
    WHERE pb.prefecture = '神奈川県' AND pb.file_name = '青葉区_normalized.csv';
    
    RAISE NOTICE '=== Deletion Summary ===';
    RAISE NOTICE '北海道 西興部町 records to be deleted: %', hokkaido_count;
    RAISE NOTICE '長野県 筑北村 records to be deleted: %', nagano_chikuhoku_count;
    RAISE NOTICE '長野県 諏訪市 records to be deleted: %', nagano_suwa_count;
    RAISE NOTICE '神奈川県 青葉区 records to be deleted: %', kanagawa_aoba_count;
    RAISE NOTICE 'Related poster_activities to be cascade deleted (北海道): %', hokkaido_activities;
    RAISE NOTICE 'Related poster_activities to be cascade deleted (長野県筑北村): %', nagano_chikuhoku_activities;
    RAISE NOTICE 'Related poster_activities to be cascade deleted (長野県諏訪市): %', nagano_suwa_activities;
    RAISE NOTICE 'Related poster_activities to be cascade deleted (神奈川県青葉区): %', kanagawa_aoba_activities;
    RAISE NOTICE 'Related poster_board_status_history to be cascade deleted (北海道): %', hokkaido_history;
    RAISE NOTICE 'Related poster_board_status_history to be cascade deleted (長野県筑北村): %', nagano_chikuhoku_history;
    RAISE NOTICE 'Related poster_board_status_history to be cascade deleted (長野県諏訪市): %', nagano_suwa_history;
    RAISE NOTICE 'Related poster_board_status_history to be cascade deleted (神奈川県青葉区): %', kanagawa_aoba_history;
END $$;

DELETE FROM poster_boards 
WHERE prefecture = '北海道' 
  AND file_name = '西興部町_normalized.csv';

DELETE FROM poster_boards 
WHERE prefecture = '長野県' 
  AND file_name = '長野県_筑北村_normalized.csv';

DELETE FROM poster_boards 
WHERE prefecture = '長野県' 
  AND file_name = '諏訪市_投票所_normalized.csv';

DELETE FROM poster_boards 
WHERE prefecture = '神奈川県' 
  AND file_name = '青葉区_normalized.csv';

DO $$
DECLARE
    hokkaido_remaining INTEGER;
    nagano_chikuhoku_remaining INTEGER;
    nagano_suwa_remaining INTEGER;
    kanagawa_aoba_remaining INTEGER;
BEGIN
    SELECT COUNT(*) INTO hokkaido_remaining
    FROM poster_boards 
    WHERE prefecture = '北海道' 
      AND file_name = '西興部町_normalized.csv';
    
    SELECT COUNT(*) INTO nagano_chikuhoku_remaining
    FROM poster_boards 
    WHERE prefecture = '長野県' 
      AND file_name = '長野県_筑北村_normalized.csv';
    
    SELECT COUNT(*) INTO nagano_suwa_remaining
    FROM poster_boards 
    WHERE prefecture = '長野県' 
      AND file_name = '諏訪市_投票所_normalized.csv';
    
    SELECT COUNT(*) INTO kanagawa_aoba_remaining
    FROM poster_boards 
    WHERE prefecture = '神奈川県' 
      AND file_name = '青葉区_normalized.csv';
    
    RAISE NOTICE '=== Verification Results ===';
    RAISE NOTICE 'Remaining 北海道 西興部町 records: %', hokkaido_remaining;
    RAISE NOTICE 'Remaining 長野県 筑北村 records: %', nagano_chikuhoku_remaining;
    RAISE NOTICE 'Remaining 長野県 諏訪市 records: %', nagano_suwa_remaining;
    RAISE NOTICE 'Remaining 神奈川県 青葉区 records: %', kanagawa_aoba_remaining;
    
    IF hokkaido_remaining > 0 THEN
        RAISE EXCEPTION 'Deletion failed for 北海道: % records still exist', hokkaido_remaining;
    END IF;
    
    IF nagano_chikuhoku_remaining > 0 THEN
        RAISE EXCEPTION 'Deletion failed for 長野県筑北村: % records still exist', nagano_chikuhoku_remaining;
    END IF;
    
    IF nagano_suwa_remaining > 0 THEN
        RAISE EXCEPTION 'Deletion failed for 長野県諏訪市: % records still exist', nagano_suwa_remaining;
    END IF;
    
    IF kanagawa_aoba_remaining > 0 THEN
        RAISE EXCEPTION 'Deletion failed for 神奈川県青葉区: % records still exist', kanagawa_aoba_remaining;
    END IF;
    
    RAISE NOTICE 'All deletions completed successfully';
END $$;
