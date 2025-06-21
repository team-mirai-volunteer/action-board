import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile_flutter/core/theme/app_theme.dart';
import 'package:mobile_flutter/features/auth/presentation/providers/auth_provider.dart';
import 'package:mobile_flutter/shared/widgets/custom_app_bar.dart';
import 'package:url_launcher/url_launcher.dart';

class SettingsPage extends ConsumerWidget {
  const SettingsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: const CustomAppBar(),
      body: Column(
        children: [
          // タイトル
          Container(
            height: 65,
            alignment: Alignment.center,
            child: Text(
              '各種設定',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                color: AppColors.textPrimary,
                fontSize: 20,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
          // メニューアイテム
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                children: [
                  _buildMenuItem(
                    context,
                    title: 'アカウント設定',
                    onTap: () {
                      context.push('/account');
                    },
                  ),
                  _buildMenuItem(
                    context,
                    title: '利用規約',
                    isExternal: true,
                    onTap: () async {
                      final uri = Uri.parse('https://action.team-mir.ai/terms');
                      if (await canLaunchUrl(uri)) {
                        await launchUrl(uri);
                      }
                    },
                  ),
                  _buildMenuItem(
                    context,
                    title: 'プライバシーポリシー',
                    isExternal: true,
                    onTap: () async {
                      final uri = Uri.parse('https://action.team-mir.ai/privacy');
                      if (await canLaunchUrl(uri)) {
                        await launchUrl(uri);
                      }
                    },
                  ),
                  const SizedBox(height: 20),
                  _buildMenuItem(
                    context,
                    title: 'ログアウト',
                    isDanger: true,
                    onTap: () async {
                      final shouldLogout = await showDialog<bool>(
                        context: context,
                        builder: (context) => AlertDialog(
                          title: const Text('ログアウト'),
                          content: const Text('本当にログアウトしますか？'),
                          actions: [
                            TextButton(
                              onPressed: () => Navigator.of(context).pop(false),
                              child: const Text('キャンセル'),
                            ),
                            TextButton(
                              onPressed: () => Navigator.of(context).pop(true),
                              child: const Text(
                                'ログアウト',
                                style: TextStyle(color: Colors.red),
                              ),
                            ),
                          ],
                        ),
                      );
                      
                      if (shouldLogout == true) {
                        await ref.read(authNotifierProvider.notifier).signOut();
                      }
                    },
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMenuItem(
    BuildContext context, {
    required String title,
    required VoidCallback onTap,
    bool isExternal = false,
    bool isDanger = false,
  }) {
    return InkWell(
      onTap: onTap,
      child: Container(
        height: 65,
        padding: const EdgeInsets.symmetric(horizontal: 30),
        alignment: Alignment.centerLeft,
        decoration: const BoxDecoration(
          border: Border(
            bottom: BorderSide(
              color: Color(0xFFE5E5E5),
              width: 1,
            ),
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              title,
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                color: isDanger ? Colors.red : AppColors.textPrimary,
              ),
            ),
            Icon(
              isExternal ? Icons.open_in_new : Icons.chevron_right,
              color: const Color(0xFF9CA3AF),
              size: isExternal ? 20 : 24,
            ),
          ],
        ),
      ),
    );
  }
}