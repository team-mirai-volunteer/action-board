import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile_flutter/core/theme/app_theme.dart';
import 'package:mobile_flutter/features/missions/presentation/providers/mission_provider.dart';
import 'package:mobile_flutter/features/missions/presentation/widgets/mission_card.dart';

class MissionSections extends ConsumerWidget {
  const MissionSections({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return ref.watch(missionsProvider).when(
          data: (missions) {
            // ミッションを難易度でグループ化
            final easyMissions = missions.where((m) => m.difficulty == 1).toList();
            final normalMissions = missions.where((m) => m.difficulty == 2).toList();
            final hardMissions = missions.where((m) => m.difficulty == 3).toList();

            return Column(
              children: [
                if (easyMissions.isNotEmpty)
                  MissionSection(
                    title: '🎯 まずはここから！',
                    missions: easyMissions,
                  ),
                if (normalMissions.isNotEmpty)
                  MissionSection(
                    title: '🎯ポスティング系ミッション',
                    missions: normalMissions,
                  ),
                if (hardMissions.isNotEmpty)
                  MissionSection(
                    title: '🎯高ポイントが獲得できる',
                    missions: hardMissions,
                  ),
              ],
            );
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (error, stack) => const Center(child: Text('ミッションの取得に失敗しました')),
        );
  }
}

class MissionSection extends StatelessWidget {
  final String title;
  final List<dynamic> missions;

  const MissionSection({
    super.key,
    required this.title,
    required this.missions,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: Color(0xFFEBEBEB), width: 1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(left: 24, top: 24, bottom: 24),
            child: Text(
              title,
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(color: AppColors.textPrimary),
            ),
          ),
          SizedBox(
            height: 240,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.only(
                left: 24,
                right: 24,
                top: 8,
                bottom: 16,
              ),
              itemCount: missions.length,
              itemBuilder: (context, index) {
                return Padding(
                  padding: const EdgeInsets.only(right: 24),
                  child: MissionCard(
                    mission: missions[index],
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