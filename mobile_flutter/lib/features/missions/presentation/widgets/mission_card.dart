import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile_flutter/features/missions/domain/entities/mission.dart';

class MissionCard extends StatelessWidget {
  final Mission mission;
  final bool isCompleted;

  const MissionCard({
    super.key,
    required this.mission,
    this.isCompleted = false,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        context.push('/missions/${mission.id}');
      },
      child: Container(
        width: 240,
        height: 209,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(10),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.15),
              blurRadius: 15,
              offset: const Offset(0, 0),
            ),
          ],
        ),
        child: Stack(
          children: [
            // グラデーションのトップボーダー
            Positioned(
              top: 0,
              left: 0,
              right: 0,
              height: 10,
              child: Container(
                decoration: const BoxDecoration(
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(10),
                    topRight: Radius.circular(10),
                  ),
                  gradient: LinearGradient(
                    begin: Alignment(-0.138, 0.87),
                    end: Alignment(1.0, 0.647),
                    colors: [Color(0xFF64D8C6), Color(0xFFBCECD3)],
                    stops: [0.0134, 1.0],
                  ),
                ),
              ),
            ),
            // コンテンツ
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // タイトル
                  SizedBox(
                    width: 212,
                    height: 48, // 16px * 1.5 * 2行 = 48px
                    child: Text(
                      mission.title,
                      style: const TextStyle(
                        fontFamily: 'Noto Sans JP',
                        color: Color(0xFF0F172A),
                        fontWeight: FontWeight.w700,
                        fontSize: 16,
                        height: 1.5,
                        letterSpacing: 0.32,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(height: 13),
                  // 区切り線
                  Container(
                    width: 212,
                    height: 1,
                    color: const Color(0xFFCBCBCB),
                  ),
                  const SizedBox(height: 13),
                  // ポイント情報
                  Column(
                    children: [
                      // ポイントと難易度
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          // ポイント
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.baseline,
                            textBaseline: TextBaseline.alphabetic,
                            children: [
                              Text(
                                '${_getPointsForDifficulty(mission.difficulty)}',
                                style: const TextStyle(
                                  fontFamily: 'Noto Sans JP',
                                  color: Color(0xFF089781),
                                  fontWeight: FontWeight.w700,
                                  fontSize: 12,
                                  height: 1.5,
                                  letterSpacing: 0.17,
                                ),
                              ),
                              const SizedBox(width: 2),
                              const Text(
                                'ポイント獲得',
                                style: TextStyle(
                                  fontFamily: 'Noto Sans JP',
                                  color: Color(0xFF1A1A1A),
                                  fontWeight: FontWeight.w400,
                                  fontSize: 12,
                                  height: 1.5,
                                  letterSpacing: 0.17,
                                ),
                              ),
                            ],
                          ),
                          // 難易度
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              const Text(
                                '難易度',
                                style: TextStyle(
                                  fontFamily: 'Noto Sans JP',
                                  color: Color(0xFF1A1A1A),
                                  fontWeight: FontWeight.w400,
                                  fontSize: 12,
                                  height: 1.5,
                                  letterSpacing: 0.17,
                                ),
                              ),
                              const SizedBox(width: 4),
                              // 星アイコン
                              _buildStars(mission.difficulty),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      // 挑戦中人数
                      const Row(
                        mainAxisAlignment: MainAxisAlignment.start,
                        crossAxisAlignment: CrossAxisAlignment.baseline,
                        textBaseline: TextBaseline.alphabetic,
                        children: [
                          Text(
                            '1,000+',
                            style: TextStyle(
                              fontFamily: 'Noto Sans JP',
                              color: Color(0xFF089781),
                              fontWeight: FontWeight.w700,
                              fontSize: 12,
                              height: 1.5,
                              letterSpacing: 0.17,
                            ),
                          ),
                          SizedBox(width: 2),
                          Text(
                            '人が挑戦中',
                            style: TextStyle(
                              fontFamily: 'Noto Sans JP',
                              color: Color(0xFF1A1A1A),
                              fontWeight: FontWeight.w400,
                              fontSize: 12,
                              height: 1.5,
                              letterSpacing: 0.24,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const Spacer(),
                  // ステータスボタン
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 3,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(150),
                      border: Border.all(
                        color: const Color(0xFFD1D5DB),
                        width: 1.5,
                      ),
                    ),
                    child: Text(
                      isCompleted ? 'クリア' : 'チャレンジ待ち',
                      style: const TextStyle(
                        fontFamily: 'Noto Sans JP',
                        color: Colors.black,
                        fontWeight: FontWeight.w700,
                        fontSize: 12,
                        height: 1.67,
                        letterSpacing: 0.24,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStars(int difficulty) {
    return Row(
      children: List.generate(
        difficulty,
        (index) => const Icon(Icons.star, size: 13, color: Color(0xFF089781)),
      ),
    );
  }

  int _getPointsForDifficulty(int difficulty) {
    // 難易度に応じたポイントを返す
    switch (difficulty) {
      case 1:
        return 100;
      case 2:
        return 150;
      case 3:
        return 300;
      case 4:
        return 500;
      default:
        return 100;
    }
  }
}
