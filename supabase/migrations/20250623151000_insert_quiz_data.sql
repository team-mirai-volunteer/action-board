-- クイズシステムの初期データ挿入

-- カテゴリIDを変数として定義
DO $$
DECLARE
    category_manifesto_id uuid := gen_random_uuid();
    category_team_id uuid := gen_random_uuid();
    
    -- 政策マニフェスト_1_中級の問題ID（5問）
    q_manifesto_1_1 uuid := gen_random_uuid();
    q_manifesto_1_2 uuid := gen_random_uuid();
    q_manifesto_1_3 uuid := gen_random_uuid();
    q_manifesto_1_4 uuid := gen_random_uuid();
    q_manifesto_1_5 uuid := gen_random_uuid();
    
    -- チームみらい_1_初級の問題ID（4問）
    q_team_1_1 uuid := gen_random_uuid();
    q_team_1_2 uuid := gen_random_uuid();
    q_team_1_3 uuid := gen_random_uuid();
    q_team_1_4 uuid := gen_random_uuid();
    
    
    -- 政策マニフェスト_2_中級の問題ID（5問）
    q_manifesto_2_1 uuid := gen_random_uuid();
    q_manifesto_2_2 uuid := gen_random_uuid();
    q_manifesto_2_3 uuid := gen_random_uuid();
    q_manifesto_2_4 uuid := gen_random_uuid();
    q_manifesto_2_5 uuid := gen_random_uuid();
    
    -- ミッションIDを変数として定義
    mission_manifesto_1_id uuid := gen_random_uuid();
    mission_team_1_id uuid := gen_random_uuid();
    mission_manifesto_2_id uuid := gen_random_uuid();
BEGIN
    -- カテゴリ挿入
    INSERT INTO quiz_categories (id, name, description, display_order) VALUES
    (category_manifesto_id, '政策・マニフェスト', 'チームみらいの政策とマニフェストに関する問題', 1),
    (category_team_id, 'チームみらい', 'チームみらいの基本情報と活動に関する問題', 2);

    -- ミッション挿入（クイズ問題より先に挿入する必要がある）
    INSERT INTO missions (id, title, icon_url, content, required_artifact_type, difficulty, max_achievement_count) VALUES
    (
      mission_manifesto_1_id,
      '政策・マニフェストクイズ（中級）に挑戦しよう',
      '/img/mission_fallback.svg',
      'チームみらいの政策・マニフェストについてのクイズです。全部で5問！全問正解でミッション達成！',
      'QUIZ',
      2,
      NULL
    ),
    (
      mission_team_1_id,
      'チームみらいクイズ（初級）に挑戦しよう',
      '/img/mission_fallback.svg',
      'チームみらいについてのクイズです。全部で4問！全問正解でミッション達成！',
      'QUIZ',
      1,
      NULL
    ),
    (
      mission_manifesto_2_id,
      '政策・マニフェストクイズ（中級2）に挑戦しよう',
      '/img/mission_fallback.svg',
      'チームみらいの政策・マニフェストについてのクイズです。全部で5問！全問正解でミッション達成！',
      'QUIZ',
      2,
      NULL
    );

    -- クイズ問題挿入
    -- 政策マニフェスト_1_中級（5問）
    INSERT INTO quiz_questions (id, category_id, question, option1, option2, option3, option4, correct_answer, explanation, mission_id, question_order) VALUES
    (q_manifesto_1_1, category_manifesto_id, 'マニフェストが指摘する日本の現状として、**誤っている**ものはどれか？', '平均年収が20年間増えていない', '出生数が過去最少を更新している', 'デジタル分野で世界的な企業が多数生まれている', '実質GDPがほとんど成長していない', 3, 'マニフェストでは、日本から世界的なインターネット企業は生まれず、デジタル赤字が増え続けていると指摘しています。', mission_manifesto_1_id, 1),
    (q_manifesto_1_2, category_manifesto_id, 'マニフェストが現在の政治に不足していると指摘している議論は何か？', '社会保障の充実', 'どう成長するか', '格差の是正', '環境問題への対策', 2, 'マニフェストは、現在の政治では『どう再分配するか』の話ばかりで『どう成長するか』の議論が不足していると指摘しています。', mission_manifesto_1_id, 2),
    (q_manifesto_1_3, category_manifesto_id, 'マニフェストが日本の経済成長の糸口として最も重要視しているものは何か？', '豊富な天然資源', '急速な人口増加', 'テクノロジー、創造性、イノベーション', '海外からの大規模投資', 3, 'マニフェストは、天然資源も人口増加もない日本が経済的成長を生み出す糸口はテクノロジー、創造性、イノベーションにこそあると述べています。', mission_manifesto_1_id, 3),
    (q_manifesto_1_4, category_manifesto_id, 'AIの発展に関して、マニフェストが日本にとってチャンスと捉えている点は何か？', 'AIを「作る」技術で世界をリードしている点', 'AIの倫理基準策定で主導権を握れる点', 'AIを「使いこなす」レースが始まったばかりである点', 'AIによる失業問題への対策が最も進んでいる点', 3, 'マニフェストは、AIを「作る」レースでは米中に遅れをとっているものの、AIを「使いこなす」レースはまだ始まったばかりであり、日本にとってチャンスであると述べています。', mission_manifesto_1_id, 4),
    (q_manifesto_1_5, category_manifesto_id, 'マニフェストが提案する「未来をつくるための3ステップ」の第一歩は何か？', '長期の成長に大胆に投資する', 'デジタル時代の当たり前をやりきる', '変化に対応できる、しなやかな仕組みづくり', 'AI研究開発に国家予算の半分を投入する', 2, 'マニフェストが提案する3ステップの第一は「デジタル時代の当たり前をやりきる」ことです。', mission_manifesto_1_id, 5);

    -- チームみらい_1_初級（4問）
    INSERT INTO quiz_questions (id, category_id, question, option1, option2, option3, option4, correct_answer, explanation, mission_id, question_order) VALUES
    (q_team_1_1, category_team_id, 'チームみらいを立ち上げた安野たかひろの専門分野は？', '天気予報士', 'AIエンジニア', 'プロ棋士', '落語家', 2, '安野氏はAIエンジニア出身で、AI技術を政治に生かすことを掲げている。', mission_team_1_id, 1),
    (q_team_1_2, category_team_id, 'チームみらい公式サイトのドメインはどれ？', 'team-mirai.jp', 'team-mir.ai', 'mirai-team.jp', 'mirai2025.com', 2, '公式サイトのURLは https://team-mir.ai/ 。ドメイン末尾が .ai なのがポイント。', mission_team_1_id, 2),
    (q_team_1_3, category_team_id, 'チームみらい党首・安野たかひろの経歴として正しいものは、次のうちどれか？', '東京都知事選に立候補', 'R-1グランプリ出場', '芥川賞受賞', '宇宙飛行士として国際宇宙ステーションに滞在', 1, '2024年、東京都知事選に出馬。\n芥川賞は受賞していない。しかし、SF作家として、星新一賞優秀賞、ハヤカワSFコンテスト優秀賞を受賞。\nR-1グランプリには出場していないが、M-1グランプリにはロボットであるPepperとともに出場し、一回戦突破。', mission_team_1_id, 3),
    (q_team_1_4, category_team_id, '安野たかひろが2024年東京都知事選挙にて獲得した得票率およそ2%。得票数にするとおよそいくらか？', '15万票', '1.5万票', '1500票', '150票', 1, '有権者数がおよそ1100万人。そのうち約60%にあたる690万人が投票。その約2%の約15万票を獲得した。', mission_team_1_id, 4);

    -- 政策マニフェスト_2_中級（5問）
    INSERT INTO quiz_questions (id, category_id, question, option1, option2, option3, option4, correct_answer, explanation, mission_id, question_order) VALUES
    (q_manifesto_2_1, category_manifesto_id, 'チームみらい マニフェスト ステップ１「デジタル時代の当たり前をやりきる」で、まず指摘する日本社会の根本課題はどれ？', 'デジタル技術を日常的に活用する基盤が整っていない', '高齢化による年金財政の逼迫', '少子化による人口減少', '温室効果ガス排出の増加', 1, '教育・行政・産業などあらゆる場面でデジタル基盤が不足していることが最大の問題意識として挙げています。', mission_manifesto_2_id, 1),
    (q_manifesto_2_2, category_manifesto_id, 'チームみらい マニフェスト ステップ２「変化に対応できる、しなやかな仕組みづくり」で特に重要になる社会システムの特性として正しいのはどれ？', 'レジリエンス（回復力）とアジリティ（すぐ動ける力）', '経済的自立と自由貿易', '伝統文化の保護と観光開発', 'セキュリティ（安全性）とプライバシー保護', 1, '不確実性が高い時代に対応するにはレジリエンスとアジリティが鍵であると強調している。', mission_manifesto_2_id, 2),
    (q_manifesto_2_3, category_manifesto_id, 'チームみらい マニフェスト ステップ３「長期の成長に大胆に投資する」が"再設計"すると述べるバランスはどれとどれ？', '税制と年金制度', '国際援助費と防衛費', '民間投資と公共投資', '短期的な対応策と長期的な成長投資', 4, '短期的ショック緩和策と百年先を見据えた長期成長投資との最適バランスを再設計すると強調。', mission_manifesto_2_id, 3),
    (q_manifesto_2_4, category_manifesto_id, 'チームみらい マニフェスト 「国政政党成立後１００日プラン」で他党と協調して立ち上げるとされる超党派議連は主にどの分野を扱う？', '食糧安全保障', '原子力政策', 'AI政策', '宇宙探査', 3, '「AI政策について…オープンな超党派議連を立ち上げる」とあります。', mission_manifesto_2_id, 4),
    (q_manifesto_2_5, category_manifesto_id, 'チームみらいのマニフェストの決め方で**誤っている**ものは？', 'チームみらいのミッション・ビジョンやステップ1〜3の方向性に合致している提案だけを採択対象とする。', '改善提案は AI で自動ラベリング・要約して整理する。', '最終的な反映方針をチームでまとめる。', 'チームが作成した反映方針を、AIが一件ずつ確認し、最終的な意思決定を行う。', 4, '最終的な意思決定は、党首である安野たかひろが一件ずつ確認し行うとしている。', mission_manifesto_2_id, 5);

    -- ミッションリンクの挿入
    -- 政策・マニフェストクイズ（中級）
    INSERT INTO mission_quiz_links (mission_id, link, remark, display_order) VALUES
    (mission_manifesto_1_id, 'https://policy.team-mir.ai/view/01_%E3%83%81%E3%83%BC%E3%83%A0%E3%81%BF%E3%82%89%E3%81%84%E3%81%AE%E3%83%93%E3%82%B8%E3%83%A7%E3%83%B3.md', '政策の「チームみらいのビジョン」のページ', 1);
    
    -- 政策・マニフェストクイズ（中級2）
    INSERT INTO mission_quiz_links (mission_id, link, remark, display_order) VALUES
    (mission_manifesto_2_id, 'https://policy.team-mir.ai/view/10_%E3%82%B9%E3%83%86%E3%83%83%E3%83%97%EF%BC%91%E3%80%8C%E3%83%87%E3%82%B8%E3%82%BF%E3%83%AB%E6%99%82%E4%BB%A3%E3%81%AE%E5%BD%93%E3%81%9F%E3%82%8A%E5%89%8D%E3%82%92%E3%82%84%E3%82%8A%E3%81%8D%E3%82%8B%E3%80%8D.md', '「ステップ1」のトップページ', 1),
    (mission_manifesto_2_id, 'https://policy.team-mir.ai/view/20_%E3%82%B9%E3%83%86%E3%83%83%E3%83%97%EF%BC%92%E3%80%8C%E5%A4%89%E5%8C%96%E3%81%AB%E5%AF%BE%E5%BF%9C%E3%81%A7%E3%81%8D%E3%82%8B%E3%81%97%E3%81%AA%E3%82%84%E3%81%8B%E3%81%AA%E4%BB%95%E7%B5%84%E3%81%BF%E3%81%A5%E3%81%8F%E3%82%8A%E3%80%8D.md', '「ステップ2」のトップページ', 2),
    (mission_manifesto_2_id, 'https://policy.team-mir.ai/view/30_%E3%82%B9%E3%83%86%E3%83%83%E3%83%97%EF%BC%93%E3%80%8C%E9%95%B7%E6%9C%9F%E3%81%AE%E6%88%90%E9%95%B7%E3%81%AB%E5%A4%A7%E8%83%86%E3%81%AB%E6%8A%95%E8%B3%87%E3%81%99%E3%82%8B%E3%80%8D.md', '「ステップ3」のトップページ', 3),
    (mission_manifesto_2_id, 'https://policy.team-mir.ai/view/40_%E5%9B%BD%E6%94%BF%E6%94%BF%E5%85%9A%E6%88%90%E7%AB%8B%E5%BE%8C100%E6%97%A5%E3%83%97%E3%83%A9%E3%83%B3.md', '「国政政党成立後１００日プラン」のページ', 4);
    
    -- チームみらいクイズ（初級）
    INSERT INTO mission_quiz_links (mission_id, link, remark, display_order) VALUES
    (mission_team_1_id, 'https://team-mir.ai/', 'チームみらいHP', 1);

END $$;
