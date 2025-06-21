import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile_flutter/core/theme/app_theme.dart';
import 'package:mobile_flutter/features/auth/presentation/providers/user_profile_provider.dart';

class AccountPage extends ConsumerWidget {
  const AccountPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final userProfileAsync = ref.watch(getUserProfileProvider);

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
          'アカウント',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w700,
          ),
        ),
        centerTitle: true,
      ),
      body: userProfileAsync.when(
        data: (profile) {
          if (profile == null) {
            return const Center(child: Text('プロフィール情報が見つかりません'));
          }

          return SingleChildScrollView(
            child: Container(
              alignment: Alignment.center,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 40),
              child: Container(
                constraints: const BoxConstraints(maxWidth: 342),
                child: Column(
                  children: [
                    // アバター画像セクション
                    SizedBox(
                      width: 160,
                      height: 188,
                      child: Stack(
                        alignment: Alignment.center,
                        children: [
                          // アバター画像
                          Positioned(
                            top: 0,
                            child: Container(
                              width: 140,
                              height: 140,
                              decoration: BoxDecoration(
                                color: const Color(0xFFE5E5E5),
                                shape: BoxShape.circle,
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.25),
                                    blurRadius: 4,
                                    offset: const Offset(0, 0),
                                    spreadRadius: 0,
                                    blurStyle: BlurStyle.inner,
                                  ),
                                ],
                              ),
                              child: profile.avatarUrl != null
                                  ? ClipOval(
                                      child: Image.network(
                                        profile.avatarUrl!,
                                        width: 140,
                                        height: 140,
                                        fit: BoxFit.cover,
                                        errorBuilder:
                                            (context, error, stackTrace) {
                                              return const Icon(
                                                Icons.person,
                                                size: 60,
                                                color: Color(0xFF71717A),
                                              );
                                            },
                                      ),
                                    )
                                  : const Icon(
                                      Icons.person,
                                      size: 60,
                                      color: Color(0xFF71717A),
                                    ),
                            ),
                          ),
                          // 画像を変更するボタン
                          Positioned(
                            bottom: 0,
                            child: OutlinedButton(
                              onPressed: () {
                                // TODO: 画像選択処理
                              },
                              style: OutlinedButton.styleFrom(
                                backgroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 30,
                                  vertical: 8,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(150),
                                ),
                                side: const BorderSide(
                                  color: Color(0xFFE4E4E7),
                                  width: 1,
                                ),
                              ),
                              child: Text(
                                '画像を変更する',
                                style: Theme.of(context).textTheme.bodyMedium
                                    ?.copyWith(color: AppColors.textPrimary),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
                    // 入力フィールドセクション
                    Column(
                      children: [
                        // ニックネーム
                        _buildInputField(
                          context,
                          label: 'ニックネーム',
                          value: profile.displayName,
                          readOnly: false,
                        ),
                        const SizedBox(height: 24),
                        // 生年月日
                        _buildInputField(
                          context,
                          label: '生年月日',
                          value:
                              '${profile.dateOfBirth.year}/${profile.dateOfBirth.month.toString().padLeft(2, '0')}/${profile.dateOfBirth.day.toString().padLeft(2, '0')}',
                          readOnly: true,
                          suffixText: '※変更できません',
                        ),
                        const SizedBox(height: 24),
                        // 都道府県
                        _buildDropdownField(
                          context,
                          label: '都道府県',
                          value: profile.addressPrefecture,
                        ),
                        const SizedBox(height: 24),
                        // 郵便番号
                        _buildInputField(
                          context,
                          label: '郵便番号',
                          value: profile.postcode,
                          readOnly: false,
                          suffixLabel: '※公開されません',
                        ),
                        const SizedBox(height: 24),
                        // X（旧Twitter）のユーザー名
                        _buildInputField(
                          context,
                          label: 'X（旧Twitter）のユーザー名',
                          value: profile.xUsername ?? '',
                          readOnly: false,
                          hintText: '例）team_mirai_jp',
                          suffixLabel: '任意',
                          suffixText: '@を除いたユーザー名（ID）を入力ください',
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                    // 保存ボタン
                    ElevatedButton(
                      onPressed: () {
                        // TODO: 設定を保存
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        minimumSize: const Size(double.infinity, 44),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(150),
                        ),
                      ),
                      child: Text(
                        '設定を保存する',
                        style: Theme.of(context).textTheme.titleMedium
                            ?.copyWith(
                              color: Colors.white,
                              fontWeight: FontWeight.w700,
                            ),
                      ),
                    ),
                    const SizedBox(height: 32),
                    // トップへ戻るボタン
                    TextButton(
                      onPressed: () {
                        context.go('/home');
                      },
                      style: TextButton.styleFrom(
                        backgroundColor: const Color(0xFFF1F5F9),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 30,
                          vertical: 8,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(150),
                        ),
                      ),
                      child: Text(
                        'アクションボードトップ',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppColors.textPrimary,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(child: Text('エラーが発生しました: $error')),
      ),
    );
  }

  Widget _buildInputField(
    BuildContext context, {
    required String label,
    required String value,
    required bool readOnly,
    String? hintText,
    String? suffixText,
    String? suffixLabel,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // ラベル行
        Row(
          children: [
            Text(
              label,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: AppColors.textPrimary,
                fontWeight: FontWeight.w700,
              ),
            ),
            if (suffixLabel != null) ...[
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 0,
                ),
                decoration: BoxDecoration(
                  border: Border.all(color: const Color(0xFFE4E4E4), width: 1),
                  borderRadius: BorderRadius.circular(150),
                ),
                child: Text(
                  suffixLabel,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: const Color(0xFF52525B),
                  ),
                ),
              ),
            ],
          ],
        ),
        const SizedBox(height: 6),
        // 入力フィールド
        TextFormField(
          initialValue: value,
          readOnly: readOnly,
          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
            color: readOnly ? const Color(0xFF292524) : AppColors.textPrimary,
          ),
          decoration: InputDecoration(
            filled: readOnly,
            fillColor: readOnly ? const Color(0xFFF9F9F9) : null,
            hintText: hintText,
            hintStyle: Theme.of(
              context,
            ).textTheme.bodyLarge?.copyWith(color: const Color(0xFF838D99)),
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 12,
              vertical: 8,
            ),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(6),
              borderSide: BorderSide(
                color: readOnly
                    ? const Color(0xFFE2E8F0)
                    : const Color(0xFFCBD5E1),
              ),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(6),
              borderSide: BorderSide(
                color: readOnly
                    ? const Color(0xFFE2E8F0)
                    : const Color(0xFFCBD5E1),
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(6),
              borderSide: const BorderSide(color: AppColors.primary, width: 2),
            ),
          ),
        ),
        if (suffixText != null) ...[
          const SizedBox(height: 4),
          Text(
            suffixText,
            style: Theme.of(
              context,
            ).textTheme.bodySmall?.copyWith(color: const Color(0xFF3F3F46)),
          ),
        ],
      ],
    );
  }

  Widget _buildDropdownField(
    BuildContext context, {
    required String label,
    required String value,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 6),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: const Color(0xFFCBD5E1)),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: value,
              isExpanded: true,
              icon: const Icon(
                Icons.keyboard_arrow_down,
                color: Color(0xFF27272A),
              ),
              style: Theme.of(
                context,
              ).textTheme.bodyLarge?.copyWith(color: AppColors.textPrimary),
              onChanged: (String? newValue) {
                // TODO: 都道府県変更処理
              },
              items: [DropdownMenuItem(value: value, child: Text(value))],
            ),
          ),
        ),
      ],
    );
  }
}
