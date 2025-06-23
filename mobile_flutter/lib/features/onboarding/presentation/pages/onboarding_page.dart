import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile_flutter/features/onboarding/presentation/providers/onboarding_provider.dart';
import 'package:url_launcher/url_launcher.dart';

class OnboardingPage extends ConsumerStatefulWidget {
  const OnboardingPage({super.key});

  @override
  ConsumerState<OnboardingPage> createState() => _OnboardingPageState();
}

class _OnboardingPageState extends ConsumerState<OnboardingPage>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeIn),
    );

    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  Future<void> _acceptTermsAndContinue() async {
    await ref.read(onboardingNotifierProvider.notifier).acceptTerms();
    if (mounted) {
      context.go('/auth/sign-in');
    }
  }

  Future<void> _launchURL(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment(0.0, -0.37),
            end: Alignment(1.0, 0.65),
            colors: [Color(0xFF64D8C6), Color(0xFFBCECD3)],
            stops: [0.013, 1.0],
          ),
        ),
        child: SafeArea(
          child: FadeTransition(
            opacity: _fadeAnimation,
            child: Center(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // ロゴ
                    SizedBox(
                      width: 143.28,
                      height: 120,
                      child: Image.asset(
                        'assets/img/logo_gradient.png',
                        fit: BoxFit.contain,
                      ),
                    ),
                    const SizedBox(height: 16),
                    // メインテキスト
                    const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 12.0),
                      child: Text(
                        '未来を動かすのは、あなたのアクション。\n社会の「なんとかしたい」を、ここから。\nこのボードには、あなたにできる\nアクションがたくさん並んでいます。(仮)',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: Colors.black,
                          height: 1.75,
                          letterSpacing: 0.17,
                        ),
                      ),
                    ),
                    const SizedBox(height: 32),
                    // 利用規約・プライバシーポリシー
                    RichText(
                      textAlign: TextAlign.center,
                      text: TextSpan(
                        style: const TextStyle(
                          fontSize: 16,
                          color: Colors.black,
                          fontWeight: FontWeight.w400,
                          height: 1.75,
                          letterSpacing: 0.32,
                        ),
                        children: [
                          TextSpan(
                            text: '利用規約',
                            style: const TextStyle(
                              decoration: TextDecoration.underline,
                              fontWeight: FontWeight.w400,
                            ),
                            recognizer: TapGestureRecognizer()
                              ..onTap = () => _launchURL(
                                'https://action.team-mir.ai/terms',
                              ),
                          ),
                          const TextSpan(text: '・'),
                          TextSpan(
                            text: 'プライバシーポリシー',
                            style: const TextStyle(
                              decoration: TextDecoration.underline,
                              fontWeight: FontWeight.w400,
                            ),
                            recognizer: TapGestureRecognizer()
                              ..onTap = () => _launchURL(
                                'https://action.team-mir.ai/privacy',
                              ),
                          ),
                          const TextSpan(text: 'に同意して'),
                        ],
                      ),
                    ),
                    const SizedBox(height: 32),
                    // はじめるボタン
                    SizedBox(
                      width: 184,
                      height: 44,
                      child: ElevatedButton(
                        onPressed: _acceptTermsAndContinue,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: Colors.black,
                          padding: const EdgeInsets.symmetric(
                            horizontal: 32,
                            vertical: 8,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(150),
                          ),
                          elevation: 0,
                        ),
                        child: const Text(
                          'はじめる',
                          style: TextStyle(
                            fontFamily: 'Noto Sans JP',
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 0.32,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
