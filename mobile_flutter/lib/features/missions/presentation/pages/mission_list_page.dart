import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile_flutter/core/theme/app_theme.dart';
import 'package:mobile_flutter/features/missions/domain/entities/mission.dart';
import 'package:mobile_flutter/features/missions/presentation/providers/mission_provider.dart';
import 'package:mobile_flutter/features/missions/presentation/widgets/mission_card.dart';

class MissionListPage extends ConsumerWidget {
  const MissionListPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final missionsAsync = ref.watch(missionsProvider);

    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
        slivers: [
          // フレキシブルなAppBar
          SliverAppBar(
            backgroundColor: Colors.white,
            elevation: 0,
            pinned: true,
            expandedHeight: 120,
            centerTitle: true,
            flexibleSpace: FlexibleSpaceBar(
              centerTitle: true,
              title: Text(
                '🎯ミッション一覧',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: AppColors.textPrimary,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ),
          // コンテンツ
          missionsAsync.when(
            data: (missions) {
              if (missions.isEmpty) {
                return const SliverFillRemaining(
                  child: Center(child: Text('ミッションがありません')),
                );
              }

              // ミッションを難易度でグループ化
              final groupedMissions = _groupMissionsByDifficulty(missions);

              return SliverList(
                delegate: SliverChildBuilderDelegate((context, index) {
                  final category = groupedMissions.keys.elementAt(index);
                  final categoryMissions = groupedMissions[category]!;

                  return _buildMissionCategory(
                    context,
                    category: category,
                    missions: categoryMissions,
                  );
                }, childCount: groupedMissions.length),
              );
            },
            loading: () => const SliverFillRemaining(
              child: Center(child: CircularProgressIndicator()),
            ),
            error: (error, stack) => SliverFillRemaining(
              child: Center(child: Text('エラーが発生しました: $error')),
            ),
          ),
        ],
      ),
    );
  }

  Map<String, List<Mission>> _groupMissionsByDifficulty(
    List<Mission> missions,
  ) {
    final Map<String, List<Mission>> grouped = {};

    for (final mission in missions) {
      String category;
      switch (mission.difficulty) {
        case 1:
          category = '🎯 まずはここから！';
          break;
        case 2:
          category = '🎯 ポスティング系ミッション';
          break;
        case 3:
          category = '🎯 高ポイントが獲得できる';
          break;
        default:
          category = '🎯 その他のミッション';
      }

      grouped.putIfAbsent(category, () => []).add(mission);
    }

    return grouped;
  }

  Widget _buildMissionCategory(
    BuildContext context, {
    required String category,
    required List<Mission> missions,
  }) {
    return Container(
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: Color(0xFFEBEBEB), width: 1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // カテゴリタイトル
          Padding(
            padding: const EdgeInsets.fromLTRB(24, 24, 24, 24),
            child: Text(
              category,
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                color: Colors.black,
                fontWeight: FontWeight.w700,
                fontSize: 20,
              ),
            ),
          ),
          // 横スクロールのミッションリスト
          SizedBox(
            height: 240,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              itemCount: missions.length,
              itemBuilder: (context, index) {
                final mission = missions[index];
                return Padding(
                  padding: EdgeInsets.only(
                    right: index < missions.length - 1 ? 24 : 0,
                  ),
                  child: MissionCard(
                    mission: mission,
                    isCompleted: false, // TODO: 実際の達成状態を取得
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }
}
