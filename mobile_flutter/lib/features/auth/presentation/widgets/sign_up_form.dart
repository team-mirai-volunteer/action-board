import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile_flutter/core/theme/app_theme.dart';
import 'package:mobile_flutter/features/auth/presentation/providers/auth_provider.dart';
import 'package:mobile_flutter/shared/widgets/custom_text_form_field.dart';

class SignUpForm extends ConsumerStatefulWidget {
  const SignUpForm({super.key});

  @override
  ConsumerState<SignUpForm> createState() => _SignUpFormState();
}

class _SignUpFormState extends ConsumerState<SignUpForm> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isPasswordVisible = false;

  // 生年月日用の変数（デフォルト値を設定）
  int? _selectedYear = 1990;
  int? _selectedMonth = 1;
  int? _selectedDay = 1;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _signUp() {
    if (_formKey.currentState!.validate()) {
      // 生年月日のバリデーション
      if (_selectedYear == null ||
          _selectedMonth == null ||
          _selectedDay == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('生年月日を選択してください'),
            backgroundColor: AppColors.error,
          ),
        );
        return;
      }

      // 18歳以上のチェック
      final birthDate = DateTime(
        _selectedYear!,
        _selectedMonth!,
        _selectedDay!,
      );
      final now = DateTime.now();
      final age = now.year - birthDate.year;
      final isOver18 =
          age > 18 ||
          (age == 18 &&
              (now.month > birthDate.month ||
                  (now.month == birthDate.month && now.day >= birthDate.day)));

      if (!isOver18) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('18歳以上である必要があります'),
            backgroundColor: AppColors.error,
          ),
        );
        return;
      }

      // 生年月日をYYYY-MM-DD形式でフォーマット
      final formattedDateOfBirth =
          '${_selectedYear!}-${_selectedMonth!.toString().padLeft(2, '0')}-${_selectedDay!.toString().padLeft(2, '0')}';

      ref
          .read(authNotifierProvider.notifier)
          .signUpWithEmailPassword(
            email: _emailController.text.trim(),
            password: _passwordController.text,
            dateOfBirth: formattedDateOfBirth,
          );
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authNotifierProvider);

    return Container(
      constraints: const BoxConstraints(maxWidth: 354),
      child: Form(
        key: _formKey,
        child: Column(
          children: [
            // タイトル
            Text(
              'アカウントを作成する',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 16),
            // フォームフィールド
            Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // メールアドレス入力
                _buildInputField(
                  label: 'メールアドレス',
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  hintText: 'action@team-mir.ai',
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'メールアドレスを入力してください';
                    }
                    if (!RegExp(r'^[^@]+@[^@]+\.[^@]+').hasMatch(value)) {
                      return '正しいメールアドレスを入力してください';
                    }
                    return null;
                  },
                ),
                // パスワード入力
                _buildPasswordField(),
                // 生年月日入力
                _buildDateOfBirthField(),
              ],
            ),
            const SizedBox(height: 24),
            // 登録ボタン
            SizedBox(
              width: 200,
              height: 44,
              child: ElevatedButton(
                onPressed: authState.maybeWhen(
                  loading: () => null,
                  orElse: () => _signUp,
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(150),
                  ),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 32,
                    vertical: 8,
                  ),
                  elevation: 0,
                ),
                child: authState.maybeWhen(
                  loading: () => const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      color: Colors.white,
                      strokeWidth: 2,
                    ),
                  ),
                  orElse: () => Text(
                    'いますぐはじめる',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.32,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 12),
            // ログインリンク
            Center(
              child: RichText(
                textAlign: TextAlign.center,
                text: TextSpan(
                  style: Theme.of(context).textTheme.bodyMedium,
                  children: [
                    const TextSpan(text: 'すでに登録済みの方は\n'),
                    WidgetSpan(
                      child: GestureDetector(
                        onTap: () => context.go('/auth/sign-in'),
                        child: Text(
                          'ログインする',
                          style: Theme.of(context).textTheme.bodyMedium
                              ?.copyWith(
                                color: AppColors.primary,
                                decoration: TextDecoration.underline,
                                fontWeight: FontWeight.w700,
                              ),
                        ),
                      ),
                    ),
                  ],
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
    TextInputType? keyboardType,
    String? hintText,
    String? Function(String?)? validator,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        CustomTextFormField(
          controller: controller,
          keyboardType: keyboardType,
          hintText: hintText,
          validator: validator,
        ),
      ],
    );
  }

  Widget _buildPasswordField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'パスワード',
          style: Theme.of(
            context,
          ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: 8),
        CustomTextFormField(
          controller: _passwordController,
          obscureText: !_isPasswordVisible,
          hintText: '半角英数字記号8文字以上',
          suffixIcon: IconButton(
            icon: Icon(
              _isPasswordVisible ? Icons.visibility : Icons.visibility_off,
              color: AppColors.textSecondary,
              size: 20,
            ),
            onPressed: () {
              setState(() {
                _isPasswordVisible = !_isPasswordVisible;
              });
            },
          ),
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'パスワードは必須項目です';
            }
            if (value.length < 8) {
              return 'パスワードは8文字以上で入力してください';
            }
            return null;
          },
        ),
      ],
    );
  }

  Widget _buildDateOfBirthField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '生年月日（満18歳以上である必要があります）',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontSize: 15,
            fontWeight: FontWeight.w700,
            color: AppColors.primary,
          ),
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            // 年
            Expanded(
              child: Container(
                height: 44,
                decoration: BoxDecoration(
                  border: Border.all(color: AppColors.textQuaternary),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<int>(
                    value: _selectedYear,
                    hint: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      child: Text(
                        '1990年',
                        style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ),
                    isExpanded: true,
                    icon: const Icon(
                      Icons.keyboard_arrow_down,
                      color: AppColors.textQuaternary,
                    ),
                    items: List.generate(100, (index) {
                      final year = DateTime.now().year - index;
                      return DropdownMenuItem(
                        value: year,
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                          child: Text(
                            '$year年',
                            style: Theme.of(context).textTheme.bodyLarge
                                ?.copyWith(color: AppColors.textSecondary),
                          ),
                        ),
                      );
                    }),
                    onChanged: (value) {
                      setState(() {
                        _selectedYear = value;
                      });
                    },
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            // 月
            Expanded(
              child: Container(
                height: 44,
                decoration: BoxDecoration(
                  border: Border.all(color: AppColors.textQuaternary),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<int>(
                    value: _selectedMonth,
                    hint: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      child: Text(
                        '1月',
                        style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ),
                    isExpanded: true,
                    icon: const Icon(
                      Icons.keyboard_arrow_down,
                      color: AppColors.textQuaternary,
                    ),
                    items: List.generate(12, (index) {
                      final month = index + 1;
                      return DropdownMenuItem(
                        value: month,
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                          child: Text(
                            '$month月',
                            style: Theme.of(context).textTheme.bodyLarge
                                ?.copyWith(color: AppColors.textSecondary),
                          ),
                        ),
                      );
                    }),
                    onChanged: (value) {
                      setState(() {
                        _selectedMonth = value;
                      });
                    },
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            // 日
            Expanded(
              child: Container(
                height: 44,
                decoration: BoxDecoration(
                  border: Border.all(color: AppColors.textQuaternary),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<int>(
                    value: _selectedDay,
                    hint: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      child: Text(
                        '24日',
                        style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ),
                    isExpanded: true,
                    icon: const Icon(
                      Icons.keyboard_arrow_down,
                      color: AppColors.textQuaternary,
                    ),
                    items: List.generate(31, (index) {
                      final day = index + 1;
                      return DropdownMenuItem(
                        value: day,
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                          child: Text(
                            '$day日',
                            style: Theme.of(context).textTheme.bodyLarge
                                ?.copyWith(color: AppColors.textSecondary),
                          ),
                        ),
                      );
                    }),
                    onChanged: (value) {
                      setState(() {
                        _selectedDay = value;
                      });
                    },
                  ),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }
}
