

DO $$
DECLARE
    i INTEGER;
    user_uuid UUID;
    prefectures TEXT[] := ARRAY['北海道', '宮城県', '埼玉県', '千葉県', '東京都', '神奈川県', '長野県', '愛知県', '大阪府', '兵庫県', '愛媛県', '福岡県'];
    prefecture_choice TEXT;
    xp_value INTEGER;
    level_value INTEGER;
    test_name TEXT;
    test_x_username TEXT;
    test_github_username TEXT;
    created_timestamp TIMESTAMPTZ;
BEGIN
    FOR i IN 1..20000 LOOP
        user_uuid := gen_random_uuid();
        
        prefecture_choice := prefectures[1 + (i % 12)];
        
        xp_value := CASE 
            WHEN i % 100 < 50 THEN (i % 1000)  -- 50%が0-999XP
            WHEN i % 100 < 80 THEN 1000 + (i % 4000)  -- 30%が1000-4999XP
            WHEN i % 100 < 95 THEN 5000 + (i % 10000)  -- 15%が5000-14999XP
            ELSE 15000 + (i % 35000)  -- 5%が15000-49999XP
        END;
        
        level_value := CASE 
            WHEN xp_value < 100 THEN 1
            WHEN xp_value < 500 THEN 2
            WHEN xp_value < 1000 THEN 3
            WHEN xp_value < 2000 THEN 4
            WHEN xp_value < 5000 THEN 5
            WHEN xp_value < 10000 THEN 6
            WHEN xp_value < 20000 THEN 7
            WHEN xp_value < 35000 THEN 8
            ELSE 9
        END;
        
        test_name := 'テストユーザー' || LPAD(i::TEXT, 5, '0');
        
        test_x_username := CASE 
            WHEN i % 2 = 0 THEN 'test_user_' || i::TEXT
            ELSE NULL
        END;
        
        test_github_username := CASE 
            WHEN i % 10 < 3 THEN 'testuser' || i::TEXT
            ELSE NULL
        END;
        
        created_timestamp := NOW() - (RANDOM() * INTERVAL '365 days');
        
        INSERT INTO auth.users (
            id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            confirmation_token,
            recovery_token,
            email_change_token_new,
            email_change
        ) VALUES (
            user_uuid,
            'test' || i::TEXT || '@example.com',
            crypt('password123', gen_salt('bf')),
            created_timestamp,
            created_timestamp,
            created_timestamp,
            '',
            '',
            '',
            ''
        );
        
        INSERT INTO private_users (
            id,
            name,
            address_prefecture,
            date_of_birth,
            x_username,
            avatar_url,
            postcode,
            registered_at,
            created_at,
            updated_at
        ) VALUES (
            user_uuid,
            test_name,
            prefecture_choice,
            '1990-01-01'::DATE + (i % 10000)::INTEGER,  -- 1990年から約27年間の範囲
            test_x_username,
            CASE 
                WHEN i % 3 = 0 THEN 'https://example.com/avatar/' || i::TEXT || '.jpg'
                ELSE NULL
            END,
            LPAD((1000000 + (i % 8999999))::TEXT, 7, '0'),  -- 7桁の郵便番号
            created_timestamp,
            created_timestamp,
            created_timestamp
        );
        
        
        INSERT INTO user_levels (
            user_id,
            xp,
            level,
            updated_at,
            last_notified_level
        ) VALUES (
            user_uuid,
            xp_value,
            level_value,
            created_timestamp + (RANDOM() * INTERVAL '30 days'),  -- 作成から30日以内の更新
            level_value
        );
        
        IF i % 1000 = 0 THEN
            RAISE NOTICE '進捗: % / 20000 件完了', i;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'テストデータ生成完了: 20,000件のユーザーデータを作成しました';
END $$;

SELECT 
    'user_ranking_view' as table_name,
    COUNT(*) as record_count
FROM user_ranking_view
UNION ALL
SELECT 
    'public_user_profiles' as table_name,
    COUNT(*) as record_count
FROM public_user_profiles
UNION ALL
SELECT 
    'user_levels' as table_name,
    COUNT(*) as record_count
FROM user_levels
UNION ALL
SELECT 
    'private_users' as table_name,
    COUNT(*) as record_count
FROM private_users;

SELECT 
    rank,
    name,
    address_prefecture,
    xp,
    level
FROM user_ranking_view
ORDER BY rank
LIMIT 10;

SELECT 
    address_prefecture,
    COUNT(*) as user_count,
    AVG(xp)::INTEGER as avg_xp,
    MAX(xp) as max_xp,
    MIN(xp) as min_xp
FROM user_ranking_view
GROUP BY address_prefecture
ORDER BY user_count DESC;
