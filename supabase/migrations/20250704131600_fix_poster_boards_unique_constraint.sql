/******************************************************************
 *  De-duplicate poster_boards and lock in the real primary key
 ******************************************************************/

--------------------------------------------------------------------
-- 1-3.  Dedup + status precedence + delete extras
--------------------------------------------------------------------
BEGIN;

-- First, update the surviving rows with the final status
WITH dedup AS (
    SELECT
        -- keep the newest row
        (array_agg(id ORDER BY updated_at DESC))[1]                       AS keep_id,

        -- status precedence: done → other → not_yet
        (array_agg(
             status
             ORDER BY
                 CASE
                     WHEN status = 'done'     THEN 0   -- highest
                     WHEN status = 'not_yet'  THEN 2   -- lowest
                     ELSE 1                           -- middle
                 END,
                 updated_at DESC
        ))[1]                                                             AS final_status,

        row_number,
        file_name,
        prefecture
    FROM poster_boards
    GROUP BY row_number, file_name, prefecture
)
UPDATE poster_boards pb
SET    status = d.final_status
FROM   dedup d
WHERE  pb.id = d.keep_id
  AND  pb.status <> d.final_status;

-- Then, remove duplicates in a separate statement
WITH dedup AS (
    SELECT
        -- keep the newest row
        (array_agg(id ORDER BY updated_at DESC))[1]                       AS keep_id,
        row_number,
        file_name,
        prefecture
    FROM poster_boards
    GROUP BY row_number, file_name, prefecture
)
DELETE FROM poster_boards pb
USING  dedup d
WHERE  pb.row_number  = d.row_number
  AND  pb.file_name   = d.file_name
  AND  pb.prefecture  = d.prefecture
  AND  pb.id         <> d.keep_id;

COMMIT;

--------------------------------------------------------------------
-- 4.  Add the correct uniqueness guard (if it isn’t there yet)
--------------------------------------------------------------------
ALTER TABLE poster_boards 
DROP CONSTRAINT IF EXISTS poster_boards_unique_location;

ALTER TABLE poster_boards 
ADD CONSTRAINT poster_boards_row_file_prefecture_unique 
UNIQUE (row_number, file_name, prefecture);

-- Add comment explaining the new constraint
COMMENT ON CONSTRAINT poster_boards_row_file_prefecture_unique ON poster_boards IS 
'Ensures each row from a file is unique per prefecture. Allows overwriting city, number, and address for the same row-file-prefecture combination.';
