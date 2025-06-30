import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile_flutter/core/theme/app_theme.dart';
import 'package:mobile_flutter/shared/widgets/custom_app_bar.dart';

class ActivityPage extends ConsumerWidget {
  const ActivityPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: const CustomAppBar(),
      body: RefreshIndicator(
        onRefresh: () async {
          // TODO: 活動データを更新
          await Future.delayed(const Duration(seconds: 1));
        },
        child: CustomScrollView(
          slivers: [
            // 統計情報カード
            SliverToBoxAdapter(
              child: Container(
                padding: const EdgeInsets.all(16),
                child: Card(
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '今日の活動状況',
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                        const SizedBox(height: 16),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            _buildStatItem(
                              context: context,
                              icon: Icons.people,
                              label: 'アクティブユーザー',
                              value: '1,234',
                              color: AppColors.info,
                            ),
                            _buildStatItem(
                              context: context,
                              icon: Icons.flag,
                              label: '達成数',
                              value: '456',
                              color: AppColors.success,
                            ),
                            _buildStatItem(
                              context: context,
                              icon: Icons.trending_up,
                              label: '獲得XP',
                              value: '12.3K',
                              color: AppColors.warning,
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
            // 最近の活動
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Text(
                  '最近の活動',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
              ),
            ),
            const SliverToBoxAdapter(
              child: SizedBox(height: 16),
            ),
            // 活動リスト
            SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  return _buildActivityItem(context, index);
                },
                childCount: 20, // TODO: 実際の活動数
              ),
            ),
            const SliverToBoxAdapter(
              child: SizedBox(height: 16),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem({
    required BuildContext context,
    required IconData icon,
    required String label,
    required String value,
    required Color color,
  }) {
    return Column(
      children: [
        Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(
            icon,
            size: 24,
            color: color,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          value,
          style: Theme.of(context).textTheme.headlineSmall,
        ),
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
            color: AppColors.textTertiary,
          ),
        ),
      ],
    );
  }

  Widget _buildActivityItem(BuildContext context, int index) {
    final activities = [
      {
        'type': 'achievement',
        'user': 'ユーザーA',
        'action': 'ミッション「海岸清掃」を達成しました',
        'time': '5分前',
        'icon': Icons.check_circle,
        'color': AppColors.success,
      },
      {
        'type': 'level_up',
        'user': 'ユーザーB',
        'action': 'レベル10に到達しました！',
        'time': '10分前',
        'icon': Icons.arrow_upward,
        'color': AppColors.info,
      },
      {
        'type': 'new_user',
        'user': 'ユーザーC',
        'action': 'が参加しました',
        'time': '15分前',
        'icon': Icons.person_add,
        'color': const Color(0xFF8B5CF6),
      },
      {
        'type': 'milestone',
        'user': 'コミュニティ',
        'action': '合計10,000ミッション達成！',
        'time': '30分前',
        'icon': Icons.celebration,
        'color': AppColors.warning,
      },
    ];

    final activity = activities[index % activities.length];

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Card(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        child: InkWell(
          onTap: () {
            // TODO: 詳細画面へ遷移
          },
          borderRadius: BorderRadius.circular(8),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: (activity['color'] as Color).withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    activity['icon'] as IconData,
                    size: 20,
                    color: activity['color'] as Color,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      RichText(
                        text: TextSpan(
                          style: Theme.of(context).textTheme.bodyMedium,
                          children: [
                            TextSpan(
                              text: activity['user'] as String,
                              style: Theme.of(context).textTheme.titleSmall,
                            ),
                            TextSpan(
                              text: ' ${activity['action']}',
                              style: Theme.of(context).textTheme.bodyMedium,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        activity['time'] as String,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppColors.textTertiary,
                        ),
                      ),
                    ],
                  ),
                ),
                const Icon(
                  Icons.chevron_right,
                  size: 20,
                  color: AppColors.textTertiary,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}