import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile_flutter/core/config/supabase_config.dart';
import 'package:mobile_flutter/core/theme/app_theme.dart';
import 'package:mobile_flutter/features/auth/presentation/providers/auth_provider.dart';
import 'package:mobile_flutter/features/auth/presentation/providers/user_profile_provider.dart';

class AccountSetupPage extends ConsumerStatefulWidget {
  const AccountSetupPage({super.key});

  @override
  ConsumerState<AccountSetupPage> createState() => _AccountSetupPageState();
}

class _AccountSetupPageState extends ConsumerState<AccountSetupPage> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _birthdateController = TextEditingController();
  final _postcodeController = TextEditingController();
  final _xUsernameController = TextEditingController();
  
  String? _selectedPrefecture;
  DateTime? _selectedBirthdate;
  bool _isLoading = false;

  // 都道府県リスト
  final List<String> _prefectures = [
    '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
    '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
    '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
    '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
    '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
    '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
    '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
  ];

  @override
  void initState() {
    super.initState();
    // user metadataから生年月日を取得
    final user = SupabaseConfig.client.auth.currentUser;
    if (user != null && user.userMetadata?['date_of_birth'] != null) {
      final dateOfBirthStr = user.userMetadata!['date_of_birth'] as String;
      _selectedBirthdate = DateTime.parse(dateOfBirthStr);
      // TextEditingControllerに日付をセット
      _birthdateController.text = '${_selectedBirthdate!.year}/${_selectedBirthdate!.month.toString().padLeft(2, '0')}/${_selectedBirthdate!.day.toString().padLeft(2, '0')}';
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _birthdateController.dispose();
    _postcodeController.dispose();
    _xUsernameController.dispose();
    super.dispose();
  }

  Future<void> _selectDate(BuildContext context) async {
    // 生年月日は編集不可なので何もしない
  }

  Future<void> _saveAccountInfo() async {
    if (!_formKey.currentState!.validate() || _selectedPrefecture == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('すべての必須項目を入力してください')),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      // user metadataから生年月日を取得して使用
      final user = SupabaseConfig.client.auth.currentUser;
      final dateOfBirthStr = user?.userMetadata?['date_of_birth'] as String?;
      final dateOfBirth = dateOfBirthStr != null ? DateTime.parse(dateOfBirthStr) : _selectedBirthdate!;
      
      await ref.read(saveUserProfileProvider({
        'name': _nameController.text.trim(),
        'addressPrefecture': _selectedPrefecture!,
        'dateOfBirth': dateOfBirth,
        'postcode': _postcodeController.text.trim(),
        'xUsername': _xUsernameController.text.trim().isEmpty ? null : _xUsernameController.text.trim(),
      }).future);
      
      // 成功したらホーム画面へ
      if (mounted) {
        context.go('/home');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('エラーが発生しました: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _handleLogout() async {
    final shouldLogout = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('ログアウト'),
        content: const Text('ログアウトしますか？'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('キャンセル'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('ログアウト'),
          ),
        ],
      ),
    );

    if (shouldLogout == true && mounted) {
      await ref.read(authNotifierProvider.notifier).signOut();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text(
          'アカウントを作成する',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w700,
          ),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: Color(0xFF18181B)),
            onPressed: _handleLogout,
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // フォーム
            Container(
              alignment: Alignment.center,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 40),
              child: Container(
                constraints: const BoxConstraints(maxWidth: 342),
                  child: Form(
                    key: _formKey,
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
                              child: const Icon(
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
                      // 入力フィールド
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // ニックネーム
                          _buildInputField(
                            label: 'ニックネーム',
                            controller: _nameController,
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'ニックネームを入力してください';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 24),
                          // 生年月日
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _buildInputField(
                                label: '生年月日',
                                controller: _birthdateController,
                                readOnly: true,
                                onTap: () => _selectDate(context),
                                validator: (value) {
                                  if (value == null || value.isEmpty) {
                                    return '生年月日を選択してください';
                                  }
                                  return null;
                                },
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '※変更できません',
                                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                  color: const Color(0xFF3F3F46),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 24),
                          // 都道府県
                          _buildDropdownField(
                            label: '都道府県',
                            value: _selectedPrefecture,
                            hint: '選択してください',
                            onChanged: (String? value) {
                              setState(() {
                                _selectedPrefecture = value;
                              });
                            },
                            items: _prefectures,
                          ),
                          const SizedBox(height: 24),
                          // 郵便番号
                          _buildInputField(
                            label: '郵便番号',
                            controller: _postcodeController,
                            keyboardType: TextInputType.number,
                            suffixLabel: '※公開されません',
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return '郵便番号を入力してください';
                              }
                              if (!RegExp(r'^\d{7}$').hasMatch(value)) {
                                return '7桁の数字で入力してください';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 24),
                          // X（旧Twitter）のユーザー名
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _buildInputField(
                                label: 'X（旧Twitter）のユーザー名',
                                controller: _xUsernameController,
                                hintText: '例）team_mirai_jp',
                                suffixLabel: '任意',
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '@を除いたユーザー名（ID）を入力ください',
                                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                  color: const Color(0xFF3F3F46),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
                      // 保存ボタン
                      ElevatedButton(
                        onPressed: _isLoading ? null : _saveAccountInfo,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          minimumSize: const Size(double.infinity, 44),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(150),
                          ),
                        ),
                        child: _isLoading
                            ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(
                                  color: Colors.white,
                                  strokeWidth: 2,
                                ),
                              )
                            : Text(
                                '保存してはじめる',
                                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInputField({
    required String label,
    required TextEditingController controller,
    bool readOnly = false,
    VoidCallback? onTap,
    String? hintText,
    String? suffixLabel,
    TextInputType? keyboardType,
    String? Function(String?)? validator,
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
          controller: controller,
          readOnly: readOnly,
          onTap: onTap,
          keyboardType: keyboardType,
          validator: validator,
          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
            color: readOnly ? const Color(0xFF292524) : AppColors.textPrimary,
          ),
          decoration: InputDecoration(
            filled: readOnly,
            fillColor: readOnly ? const Color(0xFFF9F9F9) : null,
            hintText: hintText ?? '入力してください',
            hintStyle: Theme.of(context).textTheme.bodyLarge?.copyWith(
              color: const Color(0xFF838D99),
            ),
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
      ],
    );
  }

  Widget _buildDropdownField({
    required String label,
    required String? value,
    required String hint,
    required ValueChanged<String?> onChanged,
    required List<String> items,
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
              hint: Text(hint),
              isExpanded: true,
              icon: const Icon(
                Icons.keyboard_arrow_down,
                color: Color(0xFF27272A),
              ),
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                color: AppColors.textPrimary,
              ),
              onChanged: onChanged,
              items: items
                  .map((item) => DropdownMenuItem(
                        value: item,
                        child: Text(item),
                      ))
                  .toList(),
            ),
          ),
        ),
      ],
    );
  }
}