import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile_flutter/core/config/supabase_config.dart';
import 'package:mobile_flutter/core/theme/app_theme.dart';
import 'package:mobile_flutter/features/missions/domain/entities/mission_submission.dart';
import 'package:mobile_flutter/features/missions/presentation/providers/mission_provider.dart';

class MissionDetailPage extends ConsumerStatefulWidget {
  final String missionId;

  const MissionDetailPage({
    super.key,
    required this.missionId,
  });

  @override
  ConsumerState<MissionDetailPage> createState() => _MissionDetailPageState();
}

class _MissionDetailPageState extends ConsumerState<MissionDetailPage> {
  final _formKey = GlobalKey<FormState>();
  final _noteAccountController = TextEditingController();
  final _commentController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _noteAccountController.dispose();
    _commentController.dispose();
    super.dispose();
  }

  Future<void> _submitMission() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    try {
      final user = SupabaseConfig.client.auth.currentUser;
      if (user == null) {
        throw Exception('User not authenticated');
      }

      final submission = MissionSubmission(
        missionId: widget.missionId,
        userId: user.id,
        artifactType: 'TEXT',
        textContent: _noteAccountController.text.trim(),
        description: _commentController.text.trim().isEmpty
            ? null
            : _commentController.text.trim(),
      );

      await ref.read(submitMissionCompletionProvider(submission).future);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('ミッションを完了しました！'),
            backgroundColor: AppColors.primary,
          ),
        );
        // Navigate back or to dashboard
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('エラーが発生しました: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final missionAsync = ref.watch(getMissionDetailProvider(widget.missionId));

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
          'ミッション詳細',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w700,
          ),
        ),
        centerTitle: true,
      ),
      body: missionAsync.when(
        data: (mission) {
          return SingleChildScrollView(
            child: Column(
              children: [
                // ミッション情報セクション
                Container(
                  padding: const EdgeInsets.only(bottom: 20),
                  child: Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Column(
                      children: [
                        Padding(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 20,
                            vertical: 20,
                          ),
                          child: Column(
                            children: [
                              // ミッションアイコンとラベル
                              Column(
                                children: [
                                  if (mission.iconUrl != null)
                                    Container(
                                      width: 88,
                                      height: 88,
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFF5F5F5),
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: Image.network(
                                        mission.iconUrl!,
                                        width: 88,
                                        height: 88,
                                        fit: BoxFit.cover,
                                        errorBuilder: (context, error, stackTrace) {
                                          return const Icon(
                                            Icons.image_not_supported,
                                            size: 40,
                                            color: Color(0xFF9CA3AF),
                                          );
                                        },
                                      ),
                                    )
                                  else
                                    Container(
                                      width: 88,
                                      height: 88,
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFF5F5F5),
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: const Icon(
                                        Icons.flag,
                                        size: 40,
                                        color: Color(0xFF9CA3AF),
                                      ),
                                    ),
                                  const SizedBox(height: 8),
                                  if (mission.artifactLabel != null)
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 9,
                                        vertical: 3,
                                      ),
                                      decoration: BoxDecoration(
                                        color: Colors.white,
                                        border: Border.all(
                                          color: const Color(0xFFD1D5DB),
                                          width: 1.5,
                                        ),
                                        borderRadius: BorderRadius.circular(150),
                                      ),
                                      child: Text(
                                        mission.artifactLabel!,
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodySmall
                                            ?.copyWith(
                                              color: AppColors.textPrimary,
                                            ),
                                      ),
                                    ),
                                ],
                              ),
                              const SizedBox(height: 20),
                              // ミッションタイトル
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.stretch,
                                children: [
                                  Text(
                                    'MISSION:',
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodySmall
                                        ?.copyWith(
                                          color: Colors.black,
                                          fontWeight: FontWeight.w700,
                                          letterSpacing: 2,
                                        ),
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    mission.title,
                                    style: Theme.of(context)
                                        .textTheme
                                        .titleLarge
                                        ?.copyWith(
                                          color: Colors.black,
                                          fontWeight: FontWeight.w700,
                                          letterSpacing: 2,
                                        ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        // ミッション説明
                        if (mission.content != null)
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 20),
                            child: Text(
                              mission.content!,
                              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                    color: Colors.black,
                                    letterSpacing: 2,
                                  ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
                // フォームセクション（未達成の場合のみ表示）
                if (!mission.isCompleted) ...[
                  Container(
                    margin: const EdgeInsets.symmetric(horizontal: 20),
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      border: Border.all(color: const Color(0xFFD1D5DB)),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        children: [
                          // ヘッダー
                          Column(
                            children: [
                              Text(
                                'ミッション完了を記録しよう',
                                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                      color: const Color(0xFF1A1A1A),
                                      fontWeight: FontWeight.w700,
                                      letterSpacing: 2,
                                    ),
                              ),
                              const SizedBox(height: 16),
                              Text(
                                'ミッションを完了したら、達成を記録しましょう！',
                                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                                      color: Colors.black,
                                    ),
                              ),
                              const SizedBox(height: 16),
                              Text(
                                '※入力した内容は、外部に公開されることはありません。',
                                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                      color: Colors.black,
                                    ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 28),
                          // 入力フィールド
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              // noteアカウント名入力
                              _buildInputField(
                                label: 'あなたのnoteアカウント名（必須）',
                                controller: _noteAccountController,
                                validator: (value) {
                                  if (value == null || value.isEmpty) {
                                    return 'noteアカウント名を入力してください';
                                  }
                                  return null;
                                },
                              ),
                              const SizedBox(height: 16),
                              // コメント入力
                              _buildInputField(
                                label: '補足があればコメントを入力（任意）',
                                controller: _commentController,
                                maxLines: 3,
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),
                  // 提出ボタン
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: ElevatedButton(
                      onPressed: _isSubmitting ? null : _submitMission,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        minimumSize: const Size(double.infinity, 50),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(100),
                        ),
                      ),
                      child: _isSubmitting
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                color: Colors.white,
                                strokeWidth: 2,
                              ),
                            )
                          : Text(
                              'ミッション完了を記録する',
                              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w700,
                                    letterSpacing: 2,
                                  ),
                            ),
                    ),
                  ),
                  const SizedBox(height: 32),
                  // 注意書き
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Text(
                      '※成果物の内容が認められない場合、ミッション達成と獲得ポイントが取り消される場合があります。正確な内容を記入いただくようお願いいたします。',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: const Color(0xFF18181B),
                            letterSpacing: 2,
                          ),
                    ),
                  ),
                ] else ...[
                  // 達成済みメッセージ
                  Container(
                    margin: const EdgeInsets.symmetric(horizontal: 20),
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF0FDF4),
                      border: Border.all(color: const Color(0xFF86EFAC)),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Column(
                      children: [
                        const Icon(
                          Icons.check_circle,
                          size: 48,
                          color: Color(0xFF22C55E),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'このミッションは達成済みです！',
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                color: const Color(0xFF166534),
                                fontWeight: FontWeight.w700,
                              ),
                        ),
                      ],
                    ),
                  ),
                ],
                const SizedBox(height: 60),
                // ダッシュボードに戻るボタン
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 40),
                  child: ElevatedButton(
                    onPressed: () => context.go('/home'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF1A1A1A),
                      minimumSize: const Size(310, 50),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(100),
                      ),
                    ),
                    child: Text(
                      'ダッシュボードにもどる',
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                            color: Colors.white,
                            letterSpacing: 2,
                          ),
                    ),
                  ),
                ),
                const SizedBox(height: 40),
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text('エラーが発生しました: $error'),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => ref.refresh(getMissionDetailProvider(widget.missionId)),
                child: const Text('再試行'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInputField({
    required String label,
    required TextEditingController controller,
    String? Function(String?)? validator,
    int maxLines = 1,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: const Color(0xFF0F172A),
                letterSpacing: 2,
              ),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          validator: validator,
          maxLines: maxLines,
          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                color: Colors.black,
              ),
          decoration: InputDecoration(
            filled: true,
            fillColor: const Color(0xFFF8FAFC),
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 12,
            ),
            helperText: ' ',
            helperStyle: const TextStyle(height: 0.7),
            errorStyle: const TextStyle(height: 1.0),
            errorMaxLines: 2,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(
                color: Color(0xFFCBD5E1),
              ),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(
                color: Color(0xFFCBD5E1),
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(
                color: AppColors.primary,
                width: 2,
              ),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(
                color: AppColors.error,
              ),
            ),
          ),
        ),
      ],
    );
  }
}