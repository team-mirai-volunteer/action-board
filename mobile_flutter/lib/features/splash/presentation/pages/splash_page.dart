import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile_flutter/features/onboarding/presentation/providers/onboarding_provider.dart';

class SplashPage extends ConsumerStatefulWidget {
  const SplashPage({super.key});

  @override
  ConsumerState<SplashPage> createState() => _SplashPageState();
}

class _SplashPageState extends ConsumerState<SplashPage>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    );

    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: const Interval(0.0, 0.5, curve: Curves.easeIn),
    ));

    _scaleAnimation = Tween<double>(
      begin: 0.8,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: const Interval(0.0, 0.5, curve: Curves.easeOutCubic),
    ));

    _animationController.forward();

    _navigateToNextScreen();
  }

  Future<void> _navigateToNextScreen() async {
    await Future.delayed(const Duration(seconds: 3));
    if (!mounted) return;
    
    // 利用規約の同意状態を確認
    try {
      final hasAcceptedTerms = await ref.read(onboardingNotifierProvider.future);
      if (!mounted) return;
      
      if (hasAcceptedTerms) {
        context.go('/auth/sign-in');
      } else {
        context.go('/onboarding');
      }
    } catch (e) {
      // エラーが発生した場合はオンボーディング画面へ
      if (!mounted) return;
      context.go('/onboarding');
    }
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
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
            colors: [
              Color(0xFF64D8C6),
              Color(0xFFBCECD3),
            ],
            stops: [0.013, 1.0],
          ),
        ),
        child: Stack(
          children: [
            Center(
              child: AnimatedBuilder(
                animation: _animationController,
                builder: (context, child) {
                  return FadeTransition(
                    opacity: _fadeAnimation,
                    child: ScaleTransition(
                      scale: _scaleAnimation,
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          SizedBox(
                            width: 176.72,
                            height: 148,
                            child: Image.asset(
                              'assets/img/logo_gradient.png',
                              fit: BoxFit.contain,
                            ),
                          ),
                          const SizedBox(height: 36),
                          const Text(
                            'アクションボード',
                            style: TextStyle(
                              fontFamily: 'Noto Sans JP',
                              fontSize: 24,
                              fontWeight: FontWeight.w700,
                              color: Colors.black,
                              letterSpacing: 0.17,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
            Positioned(
              bottom: 94,
              left: 0,
              right: 0,
              child: AnimatedBuilder(
                animation: _animationController,
                builder: (context, child) {
                  return FadeTransition(
                    opacity: _fadeAnimation,
                    child: const Text(
                      'powered by チームはやま',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontFamily: 'Noto Sans JP',
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: Colors.black,
                        letterSpacing: 0.17,
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}