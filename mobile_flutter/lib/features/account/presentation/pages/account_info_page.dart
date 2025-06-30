import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile_flutter/core/theme/app_theme.dart';
import 'package:mobile_flutter/features/auth/presentation/providers/user_profile_provider.dart';

class AccountInfoPage extends ConsumerWidget {
  const AccountInfoPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final userProfileAsync = ref.watch(getUserProfileProvider);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF18181B)),
          onPressed: () {
            Navigator.of(context).pop();
          },
        ),
        title: Text(
          'アカウント',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w700,
          ),
        ),
        centerTitle: true,
      ),
      body: userProfileAsync.when(
        data: (profile) {
          if (profile == null) {
            return const Center(child: Text('プロフィール情報が見つかりません'));
          }

          return SingleChildScrollView(
            child: Column(
              children: [
                // アカウント情報セクション
                Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment(0.0, 0.5),
                      end: Alignment(1.0, 0.5),
                      colors: [Color(0xFF91E3CD), Color(0xFFB2EAD2)],
                    ),
                  ),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 18,
                    vertical: 20,
                  ),
                  child: Column(
                    children: [
                      // ユーザー情報カード
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(vertical: 20),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Column(
                          children: [
                            // アバター
                            Container(
                              width: 100,
                              height: 100,
                              decoration: const BoxDecoration(
                                shape: BoxShape.circle,
                              ),
                              child: profile.avatarUrl != null
                                  ? ClipOval(
                                      child: Image.network(
                                        profile.avatarUrl!,
                                        width: 100,
                                        height: 100,
                                        fit: BoxFit.cover,
                                        errorBuilder:
                                            (context, error, stackTrace) {
                                              return Container(
                                                color: const Color(0xFFE5E5E5),
                                                child: const Icon(
                                                  Icons.person,
                                                  size: 50,
                                                  color: Color(0xFF71717A),
                                                ),
                                              );
                                            },
                                      ),
                                    )
                                  : Container(
                                      color: const Color(0xFFE5E5E5),
                                      child: const Icon(
                                        Icons.person,
                                        size: 50,
                                        color: Color(0xFF71717A),
                                      ),
                                    ),
                            ),
                            const SizedBox(height: 16),
                            // 名前とレベル
                            Column(
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Text(
                                      profile.displayName,
                                      style: Theme.of(context)
                                          .textTheme
                                          .titleMedium
                                          ?.copyWith(
                                            color: AppColors.textPrimary,
                                            fontWeight: FontWeight.w700,
                                          ),
                                    ),
                                    const SizedBox(width: 20),
                                    Row(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.end,
                                      children: [
                                        Text(
                                          'LV.',
                                          style: Theme.of(context)
                                              .textTheme
                                              .titleMedium
                                              ?.copyWith(
                                                color: AppColors.textPrimary,
                                                fontWeight: FontWeight.w700,
                                              ),
                                        ),
                                        const SizedBox(width: 4),
                                        Text(
                                          profile.level.toString(),
                                          style: Theme.of(context)
                                              .textTheme
                                              .headlineSmall
                                              ?.copyWith(
                                                color: AppColors.textPrimary,
                                                fontWeight: FontWeight.w700,
                                              ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                // バッジ
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 10,
                                    vertical: 0,
                                  ),
                                  decoration: BoxDecoration(
                                    border: Border.all(
                                      color: AppColors.textPrimary,
                                      width: 1,
                                    ),
                                    borderRadius: BorderRadius.circular(150),
                                  ),
                                  child: Text(
                                    'せんきょのたつじん',
                                    style: Theme.of(context).textTheme.bodySmall
                                        ?.copyWith(
                                          color: AppColors.textPrimary,
                                        ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 20),
                            // 進捗情報
                            SizedBox(
                              width: 310,
                              child: Column(
                                children: [
                                  // 次のレベルまで
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Text(
                                        '次のレベルまで',
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodySmall
                                            ?.copyWith(
                                              color: const Color(0xFF1A1A1A),
                                            ),
                                      ),
                                      const SizedBox(width: 2),
                                      Text(
                                        '640ポイント🔥',
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodyMedium
                                            ?.copyWith(
                                              color: const Color(0xFF1A1A1A),
                                              fontWeight: FontWeight.w700,
                                            ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 8),
                                  // プログレスバー
                                  Container(
                                    width: 248,
                                    height: 12,
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFE2E8F0),
                                      borderRadius: BorderRadius.circular(40),
                                    ),
                                    child: Stack(
                                      children: [
                                        FractionallySizedBox(
                                          widthFactor: 0.687,
                                          child: Container(
                                            decoration: BoxDecoration(
                                              gradient: const LinearGradient(
                                                colors: [
                                                  Color(0xFF64D8C6),
                                                  Color(0xFF089781),
                                                ],
                                              ),
                                              borderRadius:
                                                  BorderRadius.circular(40),
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(height: 20),
                                  // 統計情報
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      // クリアしたミッション
                                      Row(
                                        children: [
                                          Text(
                                            'クリアしたミッション',
                                            style: Theme.of(context)
                                                .textTheme
                                                .bodySmall
                                                ?.copyWith(
                                                  color: const Color(
                                                    0xFF333333,
                                                  ),
                                                  fontWeight: FontWeight.w700,
                                                ),
                                          ),
                                          const SizedBox(width: 4),
                                          Text(
                                            '99',
                                            style: Theme.of(context)
                                                .textTheme
                                                .headlineSmall
                                                ?.copyWith(
                                                  color: AppColors.primary,
                                                  fontWeight: FontWeight.w700,
                                                ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(width: 12),
                                      Container(
                                        width: 1,
                                        height: 20,
                                        color: const Color(0xFF99A9B0),
                                      ),
                                      const SizedBox(width: 12),
                                      // 総ミッション
                                      Row(
                                        children: [
                                          Text(
                                            '総ミッション',
                                            style: Theme.of(context)
                                                .textTheme
                                                .labelSmall
                                                ?.copyWith(
                                                  color: const Color(
                                                    0xFF333333,
                                                  ),
                                                ),
                                          ),
                                          const SizedBox(width: 4),
                                          Text(
                                            '120',
                                            style: Theme.of(context)
                                                .textTheme
                                                .bodyLarge
                                                ?.copyWith(
                                                  color: AppColors.textPrimary,
                                                ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                // ランキングセクション
                Container(
                  padding: const EdgeInsets.symmetric(vertical: 32),
                  child: Column(
                    children: [
                      // タイトル
                      Column(
                        children: [
                          Text(
                            '🏅',
                            style: Theme.of(context).textTheme.displayMedium
                                ?.copyWith(fontWeight: FontWeight.w700),
                          ),
                          const SizedBox(height: 0),
                          Text(
                            'Ranking',
                            style: Theme.of(context).textTheme.headlineSmall
                                ?.copyWith(
                                  color: AppColors.textPrimary,
                                  fontWeight: FontWeight.w700,
                                ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      // ランキングアイテム
                      Container(
                        width: 342,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        decoration: const BoxDecoration(
                          color: Color(0xFFE2F6F3),
                          border: Border(
                            bottom: BorderSide(
                              color: Color(0xFFFAFAFA),
                              width: 1,
                            ),
                          ),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            // 順位
                            Container(
                              width: 24,
                              height: 24,
                              decoration: BoxDecoration(
                                color: const Color(0xFF108472),
                                borderRadius: BorderRadius.circular(150),
                              ),
                              child: Center(
                                child: Text(
                                  '92',
                                  style: Theme.of(context).textTheme.bodyMedium
                                      ?.copyWith(
                                        color: Colors.white,
                                        fontWeight: FontWeight.w700,
                                      ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            // 名前と都道府県
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    profile.displayName,
                                    style: Theme.of(context)
                                        .textTheme
                                        .titleMedium
                                        ?.copyWith(
                                          color: AppColors.textPrimary,
                                          fontWeight: FontWeight.w700,
                                        ),
                                  ),
                                  Text(
                                    profile.addressPrefecture,
                                    style: Theme.of(context)
                                        .textTheme
                                        .labelSmall
                                        ?.copyWith(
                                          color: AppColors.textPrimary,
                                        ),
                                  ),
                                ],
                              ),
                            ),
                            // ポイント
                            Container(
                              width: 82,
                              alignment: Alignment.centerRight,
                              padding: const EdgeInsets.only(right: 4),
                              child: Text(
                                '1,703,950',
                                style: Theme.of(context).textTheme.bodyMedium
                                    ?.copyWith(
                                      color: AppColors.textPrimary,
                                      fontWeight: FontWeight.w700,
                                    ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                // タイムラインセクション
                Container(
                  padding: const EdgeInsets.fromLTRB(24, 32, 24, 0),
                  child: Column(
                    children: [
                      Text(
                        '活動タイムライン',
                        style: Theme.of(context).textTheme.titleMedium
                            ?.copyWith(
                              color: AppColors.textPrimary,
                              fontWeight: FontWeight.w700,
                              fontSize: 18,
                            ),
                      ),
                      const SizedBox(height: 24),
                      // タイムラインアイテム
                      Column(
                        children: List.generate(5, (index) {
                          final timeAgo = [
                            '1分前',
                            '1分前',
                            '1分前',
                            '1時間前',
                            '6時間前',
                          ][index];
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 14),
                            child: _buildTimelineItem(
                              context,
                              avatarUrl: profile.avatarUrl,
                              text: '「チームみらいの機関誌をポスティングしよう」を達成しました！',
                              timeAgo: timeAgo,
                            ),
                          );
                        }),
                      ),
                      const SizedBox(height: 16),
                      // もっと見るボタン
                      OutlinedButton(
                        onPressed: () {
                          // TODO: タイムラインページへ遷移
                        },
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 30,
                            vertical: 8,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(150),
                          ),
                          side: const BorderSide(
                            color: Color(0xFFE4E4E7),
                            width: 1,
                          ),
                        ),
                        child: Text(
                          'タイムラインをもっと見る',
                          style: Theme.of(context).textTheme.bodyLarge
                              ?.copyWith(color: AppColors.textPrimary),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 32),
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(child: Text('エラーが発生しました: $error')),
      ),
    );
  }

  Widget _buildTimelineItem(
    BuildContext context, {
    String? avatarUrl,
    required String text,
    required String timeAgo,
  }) {
    return Container(
      padding: const EdgeInsets.only(top: 16),
      decoration: BoxDecoration(borderRadius: BorderRadius.circular(6)),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // アバター
          Container(
            width: 40,
            height: 40,
            decoration: const BoxDecoration(shape: BoxShape.circle),
            child: avatarUrl != null
                ? ClipOval(
                    child: Image.network(
                      avatarUrl,
                      width: 40,
                      height: 40,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          color: const Color(0xFFE5E5E5),
                          child: const Icon(
                            Icons.person,
                            size: 20,
                            color: Color(0xFF71717A),
                          ),
                        );
                      },
                    ),
                  )
                : Container(
                    color: const Color(0xFFE5E5E5),
                    child: const Icon(
                      Icons.person,
                      size: 20,
                      color: Color(0xFF71717A),
                    ),
                  ),
          ),
          const SizedBox(width: 16),
          // テキスト
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  text,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: timeAgo.contains('分前')
                        ? AppColors.textPrimary
                        : const Color(0xFF3F3F46),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  timeAgo,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: const Color(0xFF71717A),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
