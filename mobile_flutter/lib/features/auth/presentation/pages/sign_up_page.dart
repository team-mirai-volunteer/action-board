import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile_flutter/core/theme/app_theme.dart';
import 'package:mobile_flutter/features/auth/domain/entities/auth_state.dart';
import 'package:mobile_flutter/features/auth/presentation/providers/auth_provider.dart';

class SignUpPage extends ConsumerStatefulWidget {
  const SignUpPage({super.key});

  @override
  ConsumerState<SignUpPage> createState() => _SignUpPageState();
}

class _SignUpPageState extends ConsumerState<SignUpPage> {
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
      if (_selectedYear == null || _selectedMonth == null || _selectedDay == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('生年月日を選択してください'),
            backgroundColor: AppColors.error,
          ),
        );
        return;
      }

      // 18歳以上のチェック
      final birthDate = DateTime(_selectedYear!, _selectedMonth!, _selectedDay!);
      final now = DateTime.now();
      final age = now.year - birthDate.year;
      final isOver18 = age > 18 || (age == 18 && 
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
      final formattedDateOfBirth = '${_selectedYear!}-${_selectedMonth!.toString().padLeft(2, '0')}-${_selectedDay!.toString().padLeft(2, '0')}';
      
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

    ref.listen<AuthState>(authNotifierProvider, (previous, next) {
      next.when(
        initial: () {},
        loading: () {},
        authenticated: (_) {
          // GoRouterのリダイレクトが処理されるため、ここでは何もしない
        },
        unauthenticated: () {},
        error: (message) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(message), backgroundColor: AppColors.error),
          );
        },
      );
    });

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(
              child: Container(
                alignment: Alignment.center,
                padding: const EdgeInsets.symmetric(horizontal: 18),
                child: Container(
                  constraints: const BoxConstraints(maxWidth: 320),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                      const SizedBox(height: 65),
                      Text(
                        'アカウントを作成する',
                        style: Theme.of(context).textTheme.headlineSmall,
                      ),
                      const SizedBox(height: 30),
                      // メールアドレス入力
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'メールアドレス',
                            style: Theme.of(context).textTheme.titleMedium,
                          ),
                          const SizedBox(height: 6),
                          TextFormField(
                            controller: _emailController,
                            keyboardType: TextInputType.emailAddress,
                            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                              color: AppColors.textSecondary,
                            ),
                            decoration: InputDecoration(
                              hintText: 'action@team-mir.ai',
                              hintStyle: Theme.of(context).textTheme.bodyLarge?.copyWith(
                                color: AppColors.textSecondary,
                              ),
                              contentPadding: const EdgeInsets.only(
                                left: 12,
                                right: 12,
                                top: 12,
                                bottom: 12,
                              ),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(6),
                                borderSide: const BorderSide(
                                  color: AppColors.textQuaternary,
                                ),
                              ),
                              enabledBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(6),
                                borderSide: const BorderSide(
                                  color: AppColors.textQuaternary,
                                ),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(6),
                                borderSide: const BorderSide(
                                  color: AppColors.primary,
                                  width: 2,
                                ),
                              ),
                              errorBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(6),
                                borderSide: const BorderSide(
                                  color: AppColors.error,
                                ),
                              ),
                            ),
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
                        ],
                      ),
                      const SizedBox(height: 24),
                      // パスワード入力
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'パスワード',
                            style: Theme.of(context).textTheme.titleMedium,
                          ),
                          const SizedBox(height: 6),
                          TextFormField(
                            controller: _passwordController,
                            obscureText: !_isPasswordVisible,
                            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                              color: AppColors.textSecondary,
                            ),
                            decoration: InputDecoration(
                              hintText: '半角英数字記号8文字以上',
                              hintStyle: Theme.of(context).textTheme.bodyLarge?.copyWith(
                                color: AppColors.textSecondary,
                              ),
                              contentPadding: const EdgeInsets.only(
                                left: 12,
                                right: 12,
                                top: 12,
                                bottom: 12,
                              ),
                              suffixIcon: Padding(
                                padding: const EdgeInsets.only(right: 4),
                                child: IconButton(
                                  icon: Icon(
                                    _isPasswordVisible
                                        ? Icons.visibility
                                        : Icons.visibility_off,
                                    color: AppColors.textSecondary,
                                    size: 20,
                                  ),
                                  onPressed: () {
                                    setState(() {
                                      _isPasswordVisible = !_isPasswordVisible;
                                    });
                                  },
                                ),
                              ),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(6),
                                borderSide: const BorderSide(
                                  color: AppColors.textQuaternary,
                                ),
                              ),
                              enabledBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(6),
                                borderSide: const BorderSide(
                                  color: AppColors.textQuaternary,
                                ),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(6),
                                borderSide: const BorderSide(
                                  color: AppColors.primary,
                                  width: 2,
                                ),
                              ),
                              errorBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(6),
                                borderSide: const BorderSide(
                                  color: AppColors.error,
                                ),
                              ),
                            ),
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'パスワードを入力してください';
                              }
                              if (value.length < 8) {
                                return 'パスワードは8文字以上で入力してください';
                              }
                              return null;
                            },
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
                      // 生年月日入力
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '生年月日（満18歳以上である必要があります）',
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              color: AppColors.primary,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Row(
                            children: [
                              // 年
                              Expanded(
                                child: Container(
                                  height: 44,
                                  decoration: BoxDecoration(
                                    border: Border.all(color: AppColors.textQuaternary),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                child: DropdownButtonHideUnderline(
                                  child: DropdownButton<int>(
                                    value: _selectedYear,
                                    hint: Padding(
                                      padding: const EdgeInsets.symmetric(horizontal: 12),
                                      child: Text(
                                        '1990年',
                                        style: Theme.of(context).textTheme.bodyMedium,
                                      ),
                                    ),
                                    isExpanded: true,
                                    icon: const Icon(
                                      Icons.keyboard_arrow_down,
                                      color: AppColors.textQuaternary,
                                    ),
                                    items: List.generate(
                                      100,
                                      (index) {
                                        final year = DateTime.now().year - index;
                                        return DropdownMenuItem(
                                          value: year,
                                          child: Padding(
                                            padding: const EdgeInsets.symmetric(horizontal: 12),
                                            child: Text(
                                              '$year年',
                                              style: Theme.of(context).textTheme.bodyMedium,
                                            ),
                                          ),
                                        );
                                      },
                                    ),
                                    onChanged: (value) {
                                      setState(() {
                                        _selectedYear = value;
                                      });
                                    },
                                  ),
                                ),
                              ),
                              ),
                              const SizedBox(width: 6),
                              // 月
                              Expanded(
                                child: Container(
                                  height: 44,
                                  decoration: BoxDecoration(
                                    border: Border.all(color: AppColors.textQuaternary),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                child: DropdownButtonHideUnderline(
                                  child: DropdownButton<int>(
                                    value: _selectedMonth,
                                    hint: Padding(
                                      padding: const EdgeInsets.symmetric(horizontal: 12),
                                      child: Text(
                                        '1月',
                                        style: Theme.of(context).textTheme.bodyMedium,
                                      ),
                                    ),
                                    isExpanded: true,
                                    icon: const Icon(
                                      Icons.keyboard_arrow_down,
                                      color: AppColors.textQuaternary,
                                    ),
                                    items: List.generate(
                                      12,
                                      (index) {
                                        final month = index + 1;
                                        return DropdownMenuItem(
                                          value: month,
                                          child: Padding(
                                            padding: const EdgeInsets.symmetric(horizontal: 12),
                                            child: Text(
                                              '$month月',
                                              style: Theme.of(context).textTheme.bodyMedium,
                                            ),
                                          ),
                                        );
                                      },
                                    ),
                                    onChanged: (value) {
                                      setState(() {
                                        _selectedMonth = value;
                                      });
                                    },
                                  ),
                                ),
                              ),
                              ),
                              const SizedBox(width: 6),
                              // 日
                              Expanded(
                                child: Container(
                                  height: 44,
                                  decoration: BoxDecoration(
                                    border: Border.all(color: AppColors.textQuaternary),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                child: DropdownButtonHideUnderline(
                                  child: DropdownButton<int>(
                                    value: _selectedDay,
                                    hint: Padding(
                                      padding: const EdgeInsets.symmetric(horizontal: 12),
                                      child: Text(
                                        '24日',
                                        style: Theme.of(context).textTheme.bodyMedium,
                                      ),
                                    ),
                                    isExpanded: true,
                                    icon: const Icon(
                                      Icons.keyboard_arrow_down,
                                      color: AppColors.textQuaternary,
                                    ),
                                    items: List.generate(
                                      31,
                                      (index) {
                                        final day = index + 1;
                                        return DropdownMenuItem(
                                          value: day,
                                          child: Padding(
                                            padding: const EdgeInsets.symmetric(horizontal: 12),
                                            child: Text(
                                              '$day日',
                                              style: Theme.of(context).textTheme.bodyMedium,
                                            ),
                                          ),
                                        );
                                      },
                                    ),
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
                          if (_selectedYear == null || _selectedMonth == null || _selectedDay == null)
                            Padding(
                              padding: const EdgeInsets.only(top: 6),
                              child: Text(
                                '生年月日は必須項目です',
                                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  color: AppColors.error,
                                ),
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 40),
                      // 登録ボタン
                      SizedBox(
                        width: 300,
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
                              horizontal: 30,
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
                              '登録する',
                              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 40),
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
                                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                      color: AppColors.primary,
                                      decoration: TextDecoration.underline,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 40),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}