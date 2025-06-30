import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile_flutter/core/theme/app_theme.dart';
import 'package:mobile_flutter/shared/widgets/custom_app_bar.dart';

class TimelinePage extends ConsumerWidget {
  const TimelinePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: const CustomAppBar(),
      body: RefreshIndicator(
        onRefresh: () async {
          // TODO: タイムラインを更新
          await Future.delayed(const Duration(seconds: 1));
        },
        child: ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: 10, // TODO: 実際の投稿数
          itemBuilder: (context, index) {
            return _buildTimelineItem(context, index);
          },
        ),
      ),
    );
  }

  Widget _buildTimelineItem(BuildContext context, int index) {
    final isAchievement = index % 3 == 0; // 仮のロジック

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: InkWell(
        onTap: () {
          // TODO: 詳細画面へ遷移
        },
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ユーザー情報とタイムスタンプ
              Row(
                children: [
                  CircleAvatar(
                    radius: 20,
                    backgroundColor: AppColors.primary.withValues(alpha: 0.1),
                    child: const Icon(
                      Icons.person,
                      size: 24,
                      color: AppColors.primary,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'ユーザー ${index + 1}',
                          style: Theme.of(context).textTheme.titleSmall,
                        ),
                        Text(
                          '${index + 1}時間前',
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppColors.textTertiary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (isAchievement)
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(
                            Icons.check_circle,
                            size: 16,
                            color: AppColors.primary,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            '達成',
                            style: Theme.of(context).textTheme.labelMedium?.copyWith(
                              color: AppColors.primary,
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 12),
              // 投稿内容
              Text(
                isAchievement
                    ? 'ミッション「地域清掃活動」を達成しました！'
                    : '今日もアクションを起こしています。みんなで頑張りましょう！',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  height: 1.5,
                ),
              ),
              if (isAchievement) ...[
                const SizedBox(height: 12),
                // ミッション情報
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF4F4F5),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.assignment,
                        size: 20,
                        color: AppColors.textTertiary,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '地域清掃活動',
                              style: Theme.of(context).textTheme.titleSmall,
                            ),
                            Text(
                              '+50 XP',
                              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                color: AppColors.primary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
              const SizedBox(height: 12),
              // アクションボタン
              Row(
                children: [
                  IconButton(
                    onPressed: () {
                      // TODO: いいね機能
                    },
                    icon: const Icon(
                      Icons.favorite_border,
                      size: 20,
                    ),
                    color: AppColors.textTertiary,
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '${index * 3 + 5}',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: AppColors.textTertiary,
                    ),
                  ),
                  const SizedBox(width: 24),
                  IconButton(
                    onPressed: () {
                      // TODO: コメント機能
                    },
                    icon: const Icon(
                      Icons.chat_bubble_outline,
                      size: 20,
                    ),
                    color: AppColors.textTertiary,
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '${index + 1}',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: AppColors.textTertiary,
                    ),
                  ),
                  const Spacer(),
                  IconButton(
                    onPressed: () {
                      // TODO: シェア機能
                    },
                    icon: const Icon(
                      Icons.share,
                      size: 20,
                    ),
                    color: AppColors.textTertiary,
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}