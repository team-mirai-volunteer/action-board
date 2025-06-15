-- クイズシステムの初期データ挿入

-- カテゴリIDを変数として定義
DO $$
DECLARE
    category_manifesto_id uuid := gen_random_uuid();
    category_team_id uuid := gen_random_uuid();
    category_law_id uuid := gen_random_uuid();
    
    -- 政策・マニフェスト用の問題ID（2ミッション分）
    q_manifesto_1_1 uuid := gen_random_uuid();
    q_manifesto_1_2 uuid := gen_random_uuid();
    q_manifesto_1_3 uuid := gen_random_uuid();
    
    q_manifesto_2_1 uuid := gen_random_uuid();
    q_manifesto_2_2 uuid := gen_random_uuid();
    q_manifesto_2_3 uuid := gen_random_uuid();
    
    -- 公職選挙法用の問題ID（6ミッション分）
    q_law_1_1 uuid := gen_random_uuid();
    q_law_1_2 uuid := gen_random_uuid();
    q_law_1_3 uuid := gen_random_uuid();
    
    q_law_2_1 uuid := gen_random_uuid();
    q_law_2_2 uuid := gen_random_uuid();
    q_law_2_3 uuid := gen_random_uuid();
    
    q_law_3_1 uuid := gen_random_uuid();
    q_law_3_2 uuid := gen_random_uuid();
    q_law_3_3 uuid := gen_random_uuid();
    
    q_law_4_1 uuid := gen_random_uuid();
    q_law_4_2 uuid := gen_random_uuid();
    q_law_4_3 uuid := gen_random_uuid();
    
    q_law_5_1 uuid := gen_random_uuid();
    q_law_5_2 uuid := gen_random_uuid();
    q_law_5_3 uuid := gen_random_uuid();
    
    q_law_6_1 uuid := gen_random_uuid();
    q_law_6_2 uuid := gen_random_uuid();
    q_law_6_3 uuid := gen_random_uuid();
    
    -- ミッションIDを変数として定義
    mission_manifesto_1_id uuid := gen_random_uuid();
    mission_manifesto_2_id uuid := gen_random_uuid();
    mission_law_1_id uuid := gen_random_uuid();
    mission_law_2_id uuid := gen_random_uuid();
    mission_law_3_id uuid := gen_random_uuid();
    mission_law_4_id uuid := gen_random_uuid();
    mission_law_5_id uuid := gen_random_uuid();
    mission_law_6_id uuid := gen_random_uuid();
BEGIN
    -- カテゴリ挿入
    INSERT INTO quiz_categories (id, name, description, display_order) VALUES
    (category_manifesto_id, '政策・マニフェスト', 'チームみらいの政策とマニフェストに関する問題', 1),
    (category_team_id, 'チームみらい', 'チームみらいの基本情報と活動に関する問題', 2),
    (category_law_id, '公職選挙法', '公職選挙法に関する知識問題', 3);

    -- クイズ問題挿入
    INSERT INTO quiz_questions (id, category_id, question, option1, option2, option3, option4, correct_answer, explanation, difficulty) VALUES

    -- 政策・マニフェスト カテゴリ（ミッション1用3問）
    (q_manifesto_1_1, category_manifesto_id, 'マニフェストが指摘する日本の現状として、**誤っている**ものはどれか？', '平均年収が20年間増えていない', '出生数が過去最少を更新している', 'デジタル分野で世界的な企業が多数生まれている', '実質GDPがほとんど成長していない', 3, 'マニフェストでは、日本から世界的なインターネット企業は生まれず、デジタル赤字が増え続けていると指摘しています。', 1),

    (q_manifesto_1_2, category_manifesto_id, 'マニフェストが現在の政治に不足していると指摘している議論は何か？', '社会保障の充実', 'どう成長するか', '格差の是正', '環境問題への対策', 2, 'マニフェストは、現在の政治では『どう再分配するか』の話ばかりで『どう成長するか』の議論が不足していると指摘しています。', 1),

    (q_manifesto_1_3, category_manifesto_id, 'マニフェストが日本の経済成長の糸口として最も重要視しているものは何か？', '豊富な天然資源', '急速な人口増加', 'テクノロジー、創造性、イノベーション', '海外からの大規模投資', 3, 'マニフェストは、天然資源も人口増加もない日本が経済的成長を生み出す糸口はテクノロジー、創造性、イノベーションにこそあると述べています。', 1),

    -- 政策・マニフェスト カテゴリ（ミッション2用3問）
    (q_manifesto_2_1, category_manifesto_id, 'AIの発展に関して、マニフェストが日本にとってチャンスと捉えている点は何か？', 'AIを「作る」技術で世界をリードしている点', 'AIの倫理基準策定で主導権を握れる点', 'AIを「使いこなす」レースが始まったばかりである点', 'AIによる失業問題への対策が最も進んでいる点', 3, 'マニフェストは、AIを「作る」レースでは米中に遅れをとっているものの、AIを「使いこなす」レースはまだ始まったばかりであり、日本にとってチャンスであると述べています。', 1),

    (q_manifesto_2_2, category_manifesto_id, 'マニフェストが提案する「未来をつくるための3ステップ」の第一歩は何か？', '長期の成長に大胆に投資する', 'デジタル時代の当たり前をやりきる', '変化に対応できる、しなやかな仕組みづくり', 'AI研究開発に国家予算の半分を投入する', 2, 'マニフェストが提案する3ステップの第一は「デジタル時代の当たり前をやりきる」ことです。', 1),

    (q_manifesto_2_3, category_manifesto_id, 'チームみらい マニフェスト ステップ１「デジタル時代の当たり前をやりきる」で、まず指摘する日本社会の根本課題はどれ？', 'デジタル技術を日常的に活用する基盤が整っていない', '高齢化による年金財政の逼迫', '少子化による人口減少', '温室効果ガス排出の増加', 1, '教育・行政・産業などあらゆる場面でデジタル基盤が不足していることが最大の問題意識として挙げています。', 1),

    -- 政策・マニフェスト カテゴリ（その他の問題）
    (gen_random_uuid(), category_manifesto_id, 'チームみらい マニフェスト ステップ２「変化に対応できる、しなやかな仕組みづくり」で特に重要になる社会システムの特性として正しいのはどれ？', 'レジリエンス（回復力）とアジリティ（すぐ動ける力）', '経済的自立と自由貿易', '伝統文化の保護と観光開発', 'セキュリティ（安全性）とプライバシー保護', 1, '不確実性が高い時代に対応するにはレジリエンスとアジリティが鍵であると強調している。', 1),

    (gen_random_uuid(), category_manifesto_id, 'チームみらい マニフェスト ステップ３「長期の成長に大胆に投資する」が"再設計"すると述べるバランスはどれとどれ？', '税制と年金制度', '国際援助費と防衛費', '民間投資と公共投資', '短期的な対応策と長期的な成長投資', 4, '短期的ショック緩和策と百年先を見据えた長期成長投資との最適バランスを再設計すると強調。', 1),

    (gen_random_uuid(), category_manifesto_id, 'チームみらい マニフェスト 「国政政党成立後１００日プラン」で他党と協調して立ち上げるとされる超党派議連は主にどの分野を扱う？', '食糧安全保障', '原子力政策', 'AI政策', '宇宙探査', 3, '「AI政策について…オープンな超党派議連を立ち上げる」とあります。', 1),

    (gen_random_uuid(), category_manifesto_id, 'チームみらいのマニフェストの決め方で**誤っている**ものは？', 'チームみらいのミッション・ビジョンやステップ1〜3の方向性に合致している提案だけを採択対象とする。', '改善提案は AI で自動ラベリング・要約して整理する。', '最終的な反映方針をチームでまとめる。', 'チームが作成した反映方針を、AIが一件ずつ確認し、最終的な意思決定を行う。', 4, '最終的な意思決定は、党首である安野たかひろが一件ずつ確認し行うとしている。', 1),

    -- 公職選挙法 カテゴリ（ミッション1用3問）
    (q_law_1_1, category_law_id, '次の内、選挙運動で使用が認められているものはどれでしょうか', '電光掲示板', '船舶', 'のぼり旗などがついた自転車', '提灯', 2, '選挙船は島や水路のある選挙区で活用されてます。自転車の使用の禁止こそされてませんが、それに看板や名前の書かれたのぼり旗などを活用することは出来ません。', 1),

    (q_law_1_2, category_law_id, '選挙期間中でもボランティアが絶対に行ってはいけない行為はどれ？', '候補者事務所で電話作戦', '住宅を連続して回って投票依頼', 'SNSで政策を拡散', '駅前で法定ビラ配布', 2, '戸別訪問は公職選挙法138条で全面禁止。住宅や事業所を一軒ずつ回って投票依頼する行為は違法。', 1),

    (q_law_1_3, category_law_id, '告示日前にSNSで「参議院選ではチームみらいへ投票を！」と呼び掛けると何に当たる？', '合法な政治活動', '違法な事前運動', '通常の選挙運動', '寄附行為', 2, '選挙期間外の投票依頼は「事前運動」となり取締り対象（公選法129条）。政治活動との線引きが重要。', 1),

    -- 公職選挙法 カテゴリ（ミッション2用3問）
    (q_law_2_1, category_law_id, '一般ボランティアが選挙期間中、メーリングリストへ選挙運動メールを一斉送信した。適法か？', '違法：候補者等以外の電子メール送信は禁止', '合法：改正で自由化済み', '合法だが件名に候補名必須', '受信者同意があれば合法', 1, '電子メールによる選挙運動は候補者・政党のみ許可。一般有権者の送信・転送は不可（公選法142条の3）。', 1),

    (q_law_2_2, category_law_id, 'ボランティアが自腹で候補者名入りバナー広告をSNSに有料出稿した。結果は？', '違法：選挙運動用有料広告は禁止', '合法：金額制限内なら可', '合法：ただし表示義務あり', '候補者が払わなければ合法', 1, '選挙運動用の有料インターネット広告は何人にも禁止（公選法142条の6）。', 1),

    (q_law_2_3, category_law_id, '一般ボランティアに日当1万円を支払った。どうなる？', '領収書を出せば問題なし', '合法：2万円以下なら可', '合法：交通費実費なのでOK', '違法：買収に該当', 4, '選挙運動員は原則無報酬。報酬を出せるのは法定額のウグイス嬢等のみで、超過は買収罪。', 1),

    -- 公職選挙法 カテゴリ（ミッション3用3問）
    (q_law_3_1, category_law_id, '満17歳の高校生が候補者ツイートをリツイートした。法的に？', '違法：未成年者の選挙運動禁止', '合法：SNSは対象外', '合法：RTは表現の自由', '保護者同伴なら合法', 1, '満18歳未満は一切の選挙運動が禁止（公選法137条の2）。RTも選挙運動に該当し違法。', 1),

    (q_law_3_2, category_law_id, '投票日の朝、ボランティアが有権者を無料で車に乗せ投票所へ送った。結果は？', '合法：高齢者介助目的', '合法：自家用車ならOK', '違法：送迎行為は買収', '家族だけならOK', 3, '有権者の送迎は利益供与とみなされ買収に該当（公選法221条等）。', 1),

    (q_law_3_3, category_law_id, '衆院小選挙区候補の法定ビラを18万枚印刷して配布した。どうなる？', '違法：枚数制限超過', '合法：自己資金ならOK', '合法：頒布責任者表示で可', 'ネットで代替すればOK', 1, '法定ビラは1候補16万枚以内（公選法142条）。上限超過は違法配布。', 1),

    -- 公職選挙法 カテゴリ（ミッション4用3問）
    (q_law_4_1, category_law_id, '選挙のない時期に政党の政策を紹介するビラを配ることは？', '合法：政治活動として自由', '違法：事前運動', '買収行為', '戸別訪問扱い', 1, '特定選挙・候補に言及しなければ政治活動として認められるため合法。', 1),

    (q_law_4_2, category_law_id, '期日前投票所で自分の投票用紙を撮影し、X にアップした。', '適法：投票の自由表現', '違法：投票所内撮影は禁止', '適法：個人のSNSなら可', '違法：未成年のみ禁止', 2, '投票所内での撮影・公開は投票の秘密を侵害し公選法違反と判断される。', 1),

    (q_law_4_3, category_law_id, '告示後、LINE グループチャット50人に「○○候補に入れて」とメッセージを送った。', '違法：メールと同様禁止', '違法：50人以上はNG', '適法：SNSは有権者も解禁', '適法：友人限定なら自由', 3, 'LINE や X など SNS での選挙運動は一般有権者も可能。電子メールのみ禁止。', 1),

    -- 公職選挙法 カテゴリ（ミッション5用3問）
    (q_law_5_1, category_law_id, 'ボランティアが自費でインフルエンサーに報酬を払い、候補者PR動画を投稿させた。', '違法：有料ネット広告は禁止', '適法：個人負担ならOK', '適法：リンク先を明示すればOK', '違法：動画は許可制', 1, '有料インターネット広告は政党等を除き全面禁止。支払主体が個人でも違法。', 1),

    (q_law_5_2, category_law_id, '候補者の公約を英訳し、自分のブログに公開した。', '違法：無許可翻訳はNG', '違法：選挙運動文書図画', '適法：情報提供の選挙運動として可', '適法：政治活動に当たるため時期不問', 3, 'ウェブ上の選挙運動は有権者にも解禁。発信者情報を表示すれば翻訳公開は適法。', 1),

    (q_law_5_3, category_law_id, 'ポスター費用を集めるため、候補者非公認のクラウドファンディングを立ち上げた。', '適法：寄付上限を守ればOK', '違法：公選法の寄附禁止に抵触', '違法：クラファンは政治資金規正法のみ対象', '適法：公職選挙法に規定なし', 2, '候補者・運動員以外の者が寄附を募る行為は寄附行為の禁止に抵触し処罰対象。', 1),

    -- 公職選挙法 カテゴリ（ミッション6用3問）
    (q_law_6_1, category_law_id, '街頭演説をスマホでノーカット配信し、自チャンネルでライブ公開した。', '違法：映像配信は候補者のみ可', '適法：一般有権者もライブ配信可能', '適法：視聴者が千人未満ならOK', '違法：演説会は著作権保護', 2, 'ネット選挙解禁以降、第三者も動画配信で選挙運動ができる。発信者情報の表示だけ必要。', 1),

    (q_law_6_2, category_law_id, '告示前に Instagram の AR フィルターで候補者名入りエフェクトを公開した。', '適法：政治活動として自由', '違法：事前運動に該当', '違法：ARは広告扱い', '適法：フィルターは文書図画でない', 2, '告示前に特定候補への投票を想起させるPRは「事前運動」となり禁止。', 1),

    (q_law_6_3, category_law_id, '選挙期間中に知人へ電話をかけ「期日前投票を忘れずに」とお願いした。', '適法：電話作戦は制限なし', '違法：個別電話も禁止', '違法：録音再生はNG', '適法：投票日前日まで自由', 1, '電話による投票依頼は公選法の制限対象外で自由。ただし投票日当日はNG。', 1),

    -- 公職選挙法 カテゴリ（その他の問題）
    (gen_random_uuid(), category_law_id, '「○○候補が当選したら全員に喫茶店でコーヒー奢るよ！」と宣言して投票を呼び掛けた。', '適法：単なる約束', '違法：将来の供応買収', '適法：少額だからOK', '違法：未成年への呼び掛けのみNG', 2, '飲食物など利益供与を約束して票を求める行為は供応買収となり重い罰則。', 1),

    (gen_random_uuid(), category_law_id, '投票日当日、「まだの人は○○候補へ清き一票！」とSNS投稿。', '適法：ネットは規制外', '違法：投票日当日の選挙運動は禁止', '違法：SNSは未成年のみ禁止', '適法：ハッシュタグを付ければOK', 2, '投票日当日は一切の選挙運動が禁止され、SNSも例外なし。', 1),

    (gen_random_uuid(), category_law_id, '選挙期間中、ボランティアが友人に無料で「Team Mirai」Tシャツを配り、一緒に着て街頭へ出た。この行為は？', '適法：無償なら買収でない', '違法：衣服類の配布・着用は掲示・頒布禁止', '適法：候補者許可があればOK', '違法：適切な対価を取る必要がある', 2, '氏名類推事項を表示した衣服類は選挙運動でも使用できず、配布は頒布禁止、着用は掲示禁止（公選法142・143条）。', 1),

    (gen_random_uuid(), category_law_id, '告示前にスローガンだけをプリントした「未来を変えよう Vote!」Tシャツ（候補者・政党名なし）を自分で着て街を歩いた。適法性は？', '適法：特定候補名が無い政治活動として自由', '違法：キャッチフレーズも事前運動', '違法：Tシャツ掲示は一律不可', '適法：選管の証紙を貼ればOK', 1, '候補者・政党名に触れず投票依頼もしない一般的スローガンは政治活動の範囲で規制対象外。', 1),

    (gen_random_uuid(), category_law_id, '選挙期間中、自身のXに「#○○候補に一票を！」と投稿し、プロフィール欄にDMで連絡取れる旨を記載した。この行為は？', '違法：一般有権者のSNS投稿は禁止', '違法：候補者・政党のみ可能', '適法：発信者情報を表示しているのでOK', '適法：選挙当日でも問題なし', 3, 'ネット選挙解禁により有権者もSNSで投票依頼が可能、連絡先表示義務がある。ただし選挙当日は禁止。', 1),

    (gen_random_uuid(), category_law_id, '告示後、友人へ電話をかけ「投票は○○候補で頼むね」と伝えた。適法か？', '違法：電話も戸別訪問扱い', '適法：電話による投票依頼は自由', '適法：同時にSMSを送るとNG', '適法：投票日当日でもOK', 2, '電話での投票依頼は選挙期間中なら誰でも自由に行える（投票日当日は不可）。', 1);

    -- クイズミッション追加
    INSERT INTO missions (
      id,
      title,
      icon_url,
      content,
      required_artifact_type,
      artifact_label,
      difficulty,
      max_achievement_count,
      ogp_image_url,
      is_featured,
      is_hidden
    ) VALUES 
    (
      mission_manifesto_1_id,
      '政策・マニフェストクイズ（初級1）に挑戦しよう',
      '/img/mission_fallback.svg',
      'チームみらいの政策・マニフェストについてのクイズです。全部で3問！全問正解でミッション達成！
こちらの<a target="_blank" href="https://team-mir.ai/#policy">マニフェスト</a>から学んでからクイズに挑戦しよう！',
      'QUIZ',
      'クイズ回答',
      1,
      2,
      NULL,
      false,
      false
    ),
    (
      mission_manifesto_2_id,
      '政策・マニフェストクイズ（初級2）に挑戦しよう',
      '/img/mission_fallback.svg',
      'チームみらいの政策・マニフェストについてのクイズです。全部で3問！全問正解でミッション達成！
<a target="_blank" href="https://team-mir.ai/#policy">マニフェスト</a>をしっかり読んでから挑戦しよう！',
      'QUIZ',
      'クイズ回答',
      1,
      2,
      NULL,
      false,
      false
    ),
    (
      mission_law_1_id,
      '公職選挙法クイズ（初級1）に挑戦しよう',
      '/img/mission_fallback.svg',
      '公職選挙法についてのクイズです。全部で3問！全問正解でミッション達成！
選挙ボランティアに必要な基礎知識を身につけましょう！',
      'QUIZ',
      'クイズ回答',
      1,
      2,
      NULL,
      false,
      false
    ),
    (
      mission_law_2_id,
      '公職選挙法クイズ（初級2）に挑戦しよう',
      '/img/mission_fallback.svg',
      '公職選挙法についてのクイズです。全部で3問！全問正解でミッション達成！
デジタル時代の選挙運動について学びましょう！',
      'QUIZ',
      'クイズ回答',
      1,
      2,
      NULL,
      false,
      false
    ),
    (
      mission_law_3_id,
      '公職選挙法クイズ（初級3）に挑戦しよう',
      '/img/mission_fallback.svg',
      '公職選挙法についてのクイズです。全部で3問！全問正解でミッション達成！
選挙違反を避けるための重要な知識を身につけましょう！',
      'QUIZ',
      'クイズ回答',
      1,
      2,
      NULL,
      false,
      false
    ),
    (
      mission_law_4_id,
      '公職選挙法クイズ（初級4）に挑戦しよう',
      '/img/mission_fallback.svg',
      '公職選挙法についてのクイズです。全部で3問！全問正解でミッション達成！
政治活動と選挙運動の違いを理解しましょう！',
      'QUIZ',
      'クイズ回答',
      1,
      2,
      NULL,
      false,
      false
    ),
    (
      mission_law_5_id,
      '公職選挙法クイズ（初級5）に挑戦しよう',
      '/img/mission_fallback.svg',
      '公職選挙法についてのクイズです。全部で3問！全問正解でミッション達成！
インターネット選挙運動のルールを覚えましょう！',
      'QUIZ',
      'クイズ回答',
      1,
      2,
      NULL,
      false,
      false
    ),
    (
      mission_law_6_id,
      '公職選挙法クイズ（初級6）に挑戦しよう',
      '/img/mission_fallback.svg',
      '公職選挙法についてのクイズです。全部で3問！全問正解でミッション達成！
SNSやライブ配信のルールを学びましょう！',
      'QUIZ',
      'クイズ回答',
      1,
      2,
      NULL,
      false,
      false
    );

    -- ミッションに問題を割り当て
    -- 政策・マニフェストクイズ（初級1）
    INSERT INTO mission_quiz_questions (mission_id, question_id, question_order) VALUES
    (mission_manifesto_1_id, q_manifesto_1_1, 1),
    (mission_manifesto_1_id, q_manifesto_1_2, 2),
    (mission_manifesto_1_id, q_manifesto_1_3, 3);

    -- 政策・マニフェストクイズ（初級2）
    INSERT INTO mission_quiz_questions (mission_id, question_id, question_order) VALUES
    (mission_manifesto_2_id, q_manifesto_2_1, 1),
    (mission_manifesto_2_id, q_manifesto_2_2, 2),
    (mission_manifesto_2_id, q_manifesto_2_3, 3);

    -- 公職選挙法クイズ（初級1）
    INSERT INTO mission_quiz_questions (mission_id, question_id, question_order) VALUES
    (mission_law_1_id, q_law_1_1, 1),
    (mission_law_1_id, q_law_1_2, 2),
    (mission_law_1_id, q_law_1_3, 3);

    -- 公職選挙法クイズ（初級2）
    INSERT INTO mission_quiz_questions (mission_id, question_id, question_order) VALUES
    (mission_law_2_id, q_law_2_1, 1),
    (mission_law_2_id, q_law_2_2, 2),
    (mission_law_2_id, q_law_2_3, 3);

    -- 公職選挙法クイズ（初級3）
    INSERT INTO mission_quiz_questions (mission_id, question_id, question_order) VALUES
    (mission_law_3_id, q_law_3_1, 1),
    (mission_law_3_id, q_law_3_2, 2),
    (mission_law_3_id, q_law_3_3, 3);

    -- 公職選挙法クイズ（初級4）
    INSERT INTO mission_quiz_questions (mission_id, question_id, question_order) VALUES
    (mission_law_4_id, q_law_4_1, 1),
    (mission_law_4_id, q_law_4_2, 2),
    (mission_law_4_id, q_law_4_3, 3);

    -- 公職選挙法クイズ（初級5）
    INSERT INTO mission_quiz_questions (mission_id, question_id, question_order) VALUES
    (mission_law_5_id, q_law_5_1, 1),
    (mission_law_5_id, q_law_5_2, 2),
    (mission_law_5_id, q_law_5_3, 3);

    -- 公職選挙法クイズ（初級6）
    INSERT INTO mission_quiz_questions (mission_id, question_id, question_order) VALUES
    (mission_law_6_id, q_law_6_1, 1),
    (mission_law_6_id, q_law_6_2, 2),
    (mission_law_6_id, q_law_6_3, 3);

END $$;
