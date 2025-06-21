import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile_flutter/core/theme/app_theme.dart';
import 'package:mobile_flutter/features/home/presentation/providers/home_provider.dart';
import 'package:mobile_flutter/features/missions/presentation/providers/mission_provider.dart';
import 'package:mobile_flutter/features/missions/presentation/widgets/mission_card.dart';
import 'package:mobile_flutter/shared/widgets/custom_app_bar.dart';

class HomePage extends ConsumerStatefulWidget {
  const HomePage({super.key});

  @override
  ConsumerState<HomePage> createState() => _HomePageState();
}

class _HomePageState extends ConsumerState<HomePage> {
  final ScrollController _scrollController = ScrollController();

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: const CustomAppBar(),
      body: CustomScrollView(
        controller: _scrollController,
        slivers: [
          // メインコンテンツ
          SliverToBoxAdapter(
            child: Column(
              children: [
                // チームみらいの活動状況
                ref
                    .watch(homeStatsProvider)
                    .when(
                      data: (stats) => Container(
                        decoration: const BoxDecoration(
                          gradient: AppColors.primaryGradient,
                        ),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        child: Column(
                          children: [
                            // タイトル
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  '🐘',
                                  style: Theme.of(
                                    context,
                                  ).textTheme.displayLarge,
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  'チームみらいの活動状況',
                                  style: Theme.of(context).textTheme.titleMedium
                                      ?.copyWith(color: AppColors.textPrimary),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            // 統計情報
                            Container(
                              margin: const EdgeInsets.symmetric(
                                horizontal: 18,
                              ),
                              padding: const EdgeInsets.symmetric(
                                vertical: 14,
                                horizontal: 18,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Column(
                                children: [
                                  // アクション数
                                  Column(
                                    children: [
                                      Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.spaceBetween,
                                        children: [
                                          Text(
                                            'みんなで達成したアクション数',
                                            style: Theme.of(context)
                                                .textTheme
                                                .labelMedium
                                                ?.copyWith(
                                                  color: AppColors.textPrimary,
                                                  fontWeight: FontWeight.w700,
                                                ),
                                          ),
                                          Row(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.end,
                                            children: [
                                              Text(
                                                stats.totalActions
                                                    .toString()
                                                    .replaceAllMapped(
                                                      RegExp(
                                                        r'(\d{1,3})(?=(\d{3})+(?!\d))',
                                                      ),
                                                      (Match m) => '${m[1]},',
                                                    ),
                                                style: Theme.of(context)
                                                    .textTheme
                                                    .headlineLarge
                                                    ?.copyWith(
                                                      color:
                                                          AppColors.textPrimary,
                                                      fontSize: 30,
                                                      fontWeight:
                                                          FontWeight.w700,
                                                      height: 1.73,
                                                    ),
                                              ),
                                              Text(
                                                '件',
                                                style: Theme.of(context)
                                                    .textTheme
                                                    .headlineLarge
                                                    ?.copyWith(
                                                      color:
                                                          AppColors.textPrimary,
                                                      fontSize: 30,
                                                      fontWeight:
                                                          FontWeight.w700,
                                                      height: 1.73,
                                                    ),
                                              ),
                                            ],
                                          ),
                                        ],
                                      ),
                                      Align(
                                        alignment: Alignment.centerRight,
                                        child: Text(
                                          '1日で +${stats.dailyActionIncrease.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]},')}件⬆',
                                          style: Theme.of(context)
                                              .textTheme
                                              .labelMedium
                                              ?.copyWith(
                                                color: AppColors.primary,
                                                fontWeight: FontWeight.w700,
                                              ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 8),
                                  Container(
                                    height: 1,
                                    color: Theme.of(context).dividerColor,
                                  ),
                                  const SizedBox(height: 8),
                                  // 参加者数
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        'アクションボード参加者',
                                        style: Theme.of(context)
                                            .textTheme
                                            .labelMedium
                                            ?.copyWith(
                                              color: AppColors.textPrimary,
                                              fontWeight: FontWeight.w700,
                                            ),
                                      ),
                                      Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.end,
                                        children: [
                                          Text(
                                            '${stats.totalParticipants.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]},')}人',
                                            style: Theme.of(context)
                                                .textTheme
                                                .headlineMedium
                                                ?.copyWith(
                                                  color: AppColors.textPrimary,
                                                  fontWeight: FontWeight.w700,
                                                ),
                                          ),
                                          Text(
                                            '1日で +${stats.dailyParticipantIncrease}人⬆',
                                            style: Theme.of(context)
                                                .textTheme
                                                .labelMedium
                                                ?.copyWith(
                                                  color: AppColors.primary,
                                                  fontWeight: FontWeight.w700,
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
                      loading: () => Container(
                        decoration: const BoxDecoration(
                          gradient: AppColors.primaryGradient,
                        ),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        child: const Center(
                          child: CircularProgressIndicator(color: Colors.white),
                        ),
                      ),
                      error: (error, stack) => Container(
                        decoration: const BoxDecoration(
                          gradient: AppColors.primaryGradient,
                        ),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        child: Center(
                          child: Text(
                            'データ取得エラー',
                            style: Theme.of(context).textTheme.bodyMedium
                                ?.copyWith(color: Colors.white),
                          ),
                        ),
                      ),
                    ),
                // ミッションセクション
                ref
                    .watch(missionsProvider)
                    .when(
                      data: (missions) {
                        // ミッションを難易度でグループ化
                        final easyMissions = missions
                            .where((m) => m.difficulty == 1)
                            .toList();
                        final normalMissions = missions
                            .where((m) => m.difficulty == 2)
                            .toList();
                        final hardMissions = missions
                            .where((m) => m.difficulty == 3)
                            .toList();

                        return Column(
                          children: [
                            if (easyMissions.isNotEmpty)
                              _buildMissionSection(
                                title: '🎯 まずはここから！',
                                missions: easyMissions,
                              ),
                            if (normalMissions.isNotEmpty)
                              _buildMissionSection(
                                title: '🎯ポスティング系ミッション',
                                missions: normalMissions,
                              ),
                            if (hardMissions.isNotEmpty)
                              _buildMissionSection(
                                title: '🎯高ポイントが獲得できる',
                                missions: hardMissions,
                              ),
                          ],
                        );
                      },
                      loading: () =>
                          const Center(child: CircularProgressIndicator()),
                      error: (error, stack) =>
                          const Center(child: Text('ミッションの取得に失敗しました')),
                    ),
                // ミッション一覧へボタン
                Container(
                  padding: const EdgeInsets.symmetric(
                    vertical: 30,
                    horizontal: 24,
                  ),
                  child: ElevatedButton(
                    onPressed: () {
                      context.push('/missions');
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF089781),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 30,
                        vertical: 13,
                      ),
                      minimumSize: const Size(0, 50),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(100),
                      ),
                      elevation: 0,
                    ),
                    child: const Text(
                      'ミッション一覧へ',
                      style: TextStyle(
                        fontFamily: 'Noto Sans JP',
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        height: 1.5,
                        letterSpacing: 0.32,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMissionSection({
    required String title,
    required List<dynamic> missions,
  }) {
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
              style: Theme.of(
                context,
              ).textTheme.headlineSmall?.copyWith(color: AppColors.textPrimary),
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
