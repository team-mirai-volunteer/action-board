import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile_flutter/features/home/presentation/widgets/mission_sections.dart';
import 'package:mobile_flutter/features/home/presentation/widgets/team_stats_section.dart';
import 'package:mobile_flutter/features/home/presentation/widgets/view_all_missions_button.dart';
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
        slivers: const [
          // メインコンテンツ
          SliverToBoxAdapter(
            child: Column(
              children: [
                // チームはやまの活動状況
                TeamStatsSection(),
                // ミッションセクション
                MissionSections(),
                // ミッション一覧へボタン
                ViewAllMissionsButton(),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
