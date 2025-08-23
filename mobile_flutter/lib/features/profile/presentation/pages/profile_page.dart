import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile_flutter/core/theme/app_theme.dart';
import 'package:mobile_flutter/features/auth/presentation/providers/auth_provider.dart';

class ProfilePage extends ConsumerWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authNotifierProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text(
          'プロフィール',
          style: Theme.of(context).textTheme.headlineSmall,
        ),
        actions: [
          IconButton(
            onPressed: () {
              // TODO: 設定画面へ遷移
            },
            icon: const Icon(
              Icons.settings,
              color: AppColors.textPrimary,
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // プロフィールヘッダー
            Container(
              width: double.infinity,
              color: Colors.white,
              padding: const EdgeInsets.all(24.0),
              child: Column(
                children: [
                  // アバター
                  Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: AppColors.primary.withValues(alpha: 0.1),
                      border: Border.all(
                        color: AppColors.primary,
                        width: 3,
                      ),
                    ),
                    child: const Icon(
                      Icons.person,
                      size: 50,
                      color: AppColors.primary,
                    ),
                  ),
                  const SizedBox(height: 16),
                  // ユーザー情報
                  authState.maybeWhen(
                    authenticated: (user) => Column(
                      children: [
                        Text(
                          user.fullName ?? 'ユーザー名未設定',
                          style: Theme.of(context).textTheme.headlineSmall,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          user.email,
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: AppColors.textTertiary,
                          ),
                        ),
                      ],
                    ),
                    orElse: () => const SizedBox.shrink(),
                  ),
                  const SizedBox(height: 24),
                  // レベルとXP
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _buildStatCard(
                        context: context,
                        title: 'レベル',
                        value: '1',
                        icon: Icons.trending_up,
                      ),
                      const SizedBox(width: 16),
                      _buildStatCard(
                        context: context,
                        title: 'XP',
                        value: '0',
                        icon: Icons.star,
                      ),
                      const SizedBox(width: 16),
                      _buildStatCard(
                        context: context,
                        title: '達成数',
                        value: '0',
                        icon: Icons.flag,
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            // メニューリスト
            Container(
              color: Colors.white,
              child: Column(
                children: [
                  _buildMenuItem(
                    context: context,
                    icon: Icons.assignment,
                    title: '達成履歴',
                    onTap: () {
                      // TODO: 達成履歴画面へ遷移
                    },
                  ),
                  _buildMenuItem(
                    context: context,
                    icon: Icons.bookmark,
                    title: '保存したミッション',
                    onTap: () {
                      // TODO: 保存したミッション画面へ遷移
                    },
                  ),
                  _buildMenuItem(
                    context: context,
                    icon: Icons.person_add,
                    title: '友達を招待',
                    onTap: () {
                      // TODO: 招待画面へ遷移
                    },
                  ),
                  _buildMenuItem(
                    context: context,
                    icon: Icons.help,
                    title: 'ヘルプ',
                    onTap: () {
                      // TODO: ヘルプ画面へ遷移
                    },
                  ),
                  _buildMenuItem(
                    context: context,
                    icon: Icons.info,
                    title: 'このアプリについて',
                    onTap: () {
                      // TODO: アプリ情報画面へ遷移
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            // ログアウトボタン
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16.0),
              child: ElevatedButton(
                onPressed: () {
                  showDialog(
                    context: context,
                    builder: (context) => AlertDialog(
                      title: Text(
                        'ログアウト',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      content: Text(
                        'ログアウトしてもよろしいですか？',
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.of(context).pop(),
                          child: Text(
                            'キャンセル',
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: AppColors.textTertiary,
                            ),
                          ),
                        ),
                        TextButton(
                          onPressed: () {
                            Navigator.of(context).pop();
                            ref.read(authNotifierProvider.notifier).signOut();
                          },
                          child: Text(
                            'ログアウト',
                            style: Theme.of(context).textTheme.titleSmall?.copyWith(
                              color: AppColors.error,
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: AppColors.error,
                  side: const BorderSide(
                    color: AppColors.error,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                ),
                child: Text(
                  'ログアウト',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard({
    required BuildContext context,
    required String title,
    required String value,
    required IconData icon,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.primary.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Icon(
            icon,
            size: 24,
            color: AppColors.primary,
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              color: AppColors.primary,
            ),
          ),
          Text(
            title,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMenuItem({
    required BuildContext context,
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        decoration: const BoxDecoration(
          border: Border(
            bottom: BorderSide(
              color: AppColors.borderPrimary,
              width: 1,
            ),
          ),
        ),
        child: Row(
          children: [
            Icon(
              icon,
              size: 24,
              color: AppColors.textSecondary,
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                title,
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
            const Icon(
              Icons.chevron_right,
              size: 24,
              color: AppColors.textTertiary,
            ),
          ],
        ),
      ),
    );
  }
}