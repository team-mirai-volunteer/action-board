import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile_flutter/core/theme/app_theme.dart';
import 'package:mobile_flutter/features/auth/presentation/providers/auth_provider.dart';
import 'package:mobile_flutter/features/auth/presentation/providers/user_profile_provider.dart';

class CustomAppBar extends ConsumerWidget implements PreferredSizeWidget {
  const CustomAppBar({super.key});

  @override
  Size get preferredSize => const Size.fromHeight(56.0);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authNotifierProvider);

    return AppBar(
      backgroundColor: Colors.white,
      elevation: 0,
      automaticallyImplyLeading: false,
      title: Container(
        padding: const EdgeInsets.symmetric(horizontal: 0),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            // 左側: ロゴとアプリ名
            Row(
              children: [
                // ロゴ
                Image.asset(
                  'assets/img/logo_shiro.png',
                  width: 45,
                  height: 39,
                  errorBuilder: (context, error, stackTrace) {
                    return Container(
                      width: 45,
                      height: 39,
                      decoration: BoxDecoration(
                        color: const Color(0xFFE5E5E5),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Icon(
                        Icons.image,
                        size: 24,
                        color: Color(0xFFA1A1AA),
                      ),
                    );
                  },
                ),
                const SizedBox(width: 20),
                // アプリ名
                Text(
                  'アクションボード',
                  style: Theme.of(context).textTheme.labelMedium,
                ),
              ],
            ),
            // 右側: アカウント情報
            authState.maybeWhen(
              authenticated: (_) => Consumer(
                builder: (context, ref, child) {
                  final userProfileAsync = ref.watch(getUserProfileProvider);
                  
                  return userProfileAsync.when(
                    data: (profile) {
                      if (profile == null) {
                        return const SizedBox.shrink();
                      }
                      return GestureDetector(
                        onTap: () {
                          context.push('/account-info');
                        },
                        child: Row(
                          children: [
                            Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                // ユーザー名
                                Text(
                                  profile.displayName,
                                  style: Theme.of(context).textTheme.labelMedium,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                const SizedBox(height: 4),
                                // レベル
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFD9D9D9),
                                    borderRadius: BorderRadius.circular(50),
                                  ),
                                  child: Text(
                                    'LV.${profile.level}',
                                    style: Theme.of(context).textTheme.labelMedium?.copyWith(
                                      color: AppColors.textPrimary,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(width: 8),
                            // アバター
                            CircleAvatar(
                              radius: 20,
                              backgroundColor: const Color(0xFFE5E5E5),
                              child: profile.avatarUrl != null
                                  ? ClipOval(
                                      child: Image.network(
                                        profile.avatarUrl!,
                                        width: 40,
                                        height: 40,
                                        fit: BoxFit.cover,
                                        errorBuilder: (context, error, stackTrace) {
                                          return const Icon(
                                            Icons.person,
                                            size: 24,
                                            color: Color(0xFF71717A),
                                          );
                                        },
                                      ),
                                    )
                                  : const Icon(
                                      Icons.person,
                                      size: 24,
                                      color: Color(0xFF71717A),
                                    ),
                            ),
                          ],
                        ),
                      );
                    },
                    loading: () => const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                    error: (error, stack) => const SizedBox.shrink(),
                  );
                },
              ),
              orElse: () => const SizedBox.shrink(),
            ),
          ],
        ),
      ),
    );
  }
}