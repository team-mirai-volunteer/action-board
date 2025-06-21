import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile_flutter/core/theme/app_theme.dart';
import 'package:mobile_flutter/shared/widgets/custom_app_bar.dart';

class RankingPage extends ConsumerWidget {
  const RankingPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: const CustomAppBar(),
      body: DefaultTabController(
        length: 3,
        child: Column(
          children: [
            Container(
              color: Colors.white,
              child: TabBar(
                labelColor: AppColors.primary,
                unselectedLabelColor: AppColors.textTertiary,
                indicatorColor: AppColors.primary,
                indicatorWeight: 3,
                labelStyle: Theme.of(context).textTheme.titleSmall,
                unselectedLabelStyle: Theme.of(context).textTheme.bodyMedium,
                tabs: const [
                  Tab(text: '総合'),
                  Tab(text: '月間'),
                  Tab(text: '週間'),
                ],
              ),
            ),
            Expanded(
              child: TabBarView(
                children: [
                  _buildRankingList('総合'),
                  _buildRankingList('月間'),
                  _buildRankingList('週間'),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRankingList(String period) {
    // TODO: 実際のランキングデータを表示
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: 10,
      itemBuilder: (context, index) {
        final rank = index + 1;
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                // ランク表示
                Container(
                  width: 50,
                  height: 50,
                  decoration: BoxDecoration(
                    color: rank <= 3
                        ? _getRankColor(rank)
                        : const Color(0xFFF4F4F5),
                    shape: BoxShape.circle,
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    rank.toString(),
                    style: rank <= 3
                        ? Theme.of(context).textTheme.headlineSmall?.copyWith(
                              color: Colors.white,
                            )
                        : Theme.of(context).textTheme.titleMedium?.copyWith(
                              color: AppColors.textTertiary,
                            ),
                  ),
                ),
                const SizedBox(width: 16),
                // ユーザー情報
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'ユーザー $rank',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'レベル ${20 - index}',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppColors.textTertiary,
                        ),
                      ),
                    ],
                  ),
                ),
                // XP表示
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      '${(1000 - index * 50)} XP',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        color: AppColors.primary,
                      ),
                    ),
                    Text(
                      period,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppColors.textTertiary,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Color _getRankColor(int rank) {
    switch (rank) {
      case 1:
        return const Color(0xFFFFD700); // Gold
      case 2:
        return const Color(0xFFC0C0C0); // Silver
      case 3:
        return const Color(0xFFCD7F32); // Bronze
      default:
        return const Color(0xFFF4F4F5);
    }
  }
}