import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile_flutter/features/account/presentation/pages/account_info_page.dart';
import 'package:mobile_flutter/features/account/presentation/pages/account_page.dart';
import 'package:mobile_flutter/features/auth/domain/entities/auth_state.dart';
import 'package:mobile_flutter/features/auth/presentation/pages/account_setup_page.dart';
import 'package:mobile_flutter/features/auth/presentation/pages/forgot_password_page.dart';
import 'package:mobile_flutter/features/auth/presentation/pages/sign_in_page.dart';
import 'package:mobile_flutter/features/auth/presentation/pages/sign_up_page.dart';
import 'package:mobile_flutter/features/auth/presentation/providers/auth_provider.dart';
import 'package:mobile_flutter/features/auth/presentation/providers/user_profile_provider.dart';
import 'package:mobile_flutter/features/main/presentation/pages/main_navigation_page.dart';
import 'package:mobile_flutter/features/missions/presentation/pages/mission_list_page.dart';
import 'package:mobile_flutter/features/onboarding/presentation/pages/onboarding_page.dart';
import 'package:mobile_flutter/features/splash/presentation/pages/splash_page.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'app_router.g.dart';

// 認証状態変更時の通知用
class AuthStateNotifier extends ChangeNotifier {
  AuthState _authState = const AuthState.initial();

  AuthState get authState => _authState;

  void updateAuthState(AuthState state) {
    _authState = state;
    notifyListeners();
  }
}

final authStateNotifierProvider = Provider<AuthStateNotifier>((ref) {
  final notifier = AuthStateNotifier();

  // 認証状態の変更を監視
  ref.listen(authNotifierProvider, (previous, next) {
    notifier.updateAuthState(next);
  });

  return notifier;
});

@riverpod
GoRouter appRouter(Ref ref) {
  final authStateNotifier = ref.watch(authStateNotifierProvider);

  return GoRouter(
    initialLocation: '/splash',
    refreshListenable: authStateNotifier,
    redirect: (context, state) async {
      final authState = authStateNotifier.authState;
      final isAuthenticated = authState.maybeWhen(
        authenticated: (_) => true,
        orElse: () => false,
      );

      final isAuthRoute = state.uri.path.startsWith('/auth');
      final isSplashRoute = state.uri.path == '/splash';
      final isOnboardingRoute = state.uri.path == '/onboarding';
      final isAccountSetupRoute = state.uri.path == '/auth/account-setup';

      // スプラッシュページとオンボーディングページの場合は常に表示を許可
      if (isSplashRoute || isOnboardingRoute) {
        return null;
      }

      // 認証済みの場合
      if (isAuthenticated) {
        // アカウント設定ページにいる場合はそのまま表示
        if (isAccountSetupRoute) {
          return null;
        }

        // プロフィールの存在確認
        final hasProfile = await ref.read(hasUserProfileProvider.future);

        // プロフィールがない場合はアカウント設定ページへ
        if (!hasProfile && !isAccountSetupRoute) {
          return '/auth/account-setup';
        }

        // 認証済みで他のauth系ページにいる場合はホームにリダイレクト
        if (isAuthRoute) {
          return '/home';
        }
      }

      // 未認証でauth系ページ以外にいる場合はログインにリダイレクト
      if (!isAuthenticated && !isAuthRoute) {
        return '/auth/sign-in';
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/splash',
        pageBuilder: (context, state) {
          return CustomTransitionPage(
            key: state.pageKey,
            child: const SplashPage(),
            transitionsBuilder:
                (context, animation, secondaryAnimation, child) {
                  return FadeTransition(
                    opacity: CurvedAnimation(
                      parent: animation,
                      curve: Curves.easeInOut,
                    ),
                    child: child,
                  );
                },
            transitionDuration: const Duration(milliseconds: 200),
          );
        },
      ),
      GoRoute(
        path: '/onboarding',
        pageBuilder: (context, state) {
          return CustomTransitionPage(
            key: state.pageKey,
            child: const OnboardingPage(),
            transitionsBuilder:
                (context, animation, secondaryAnimation, child) {
                  return FadeTransition(
                    opacity: CurvedAnimation(
                      parent: animation,
                      curve: Curves.easeInOut,
                    ),
                    child: child,
                  );
                },
            transitionDuration: const Duration(milliseconds: 200),
          );
        },
      ),
      GoRoute(
        path: '/auth/sign-in',
        pageBuilder: (context, state) {
          return CustomTransitionPage(
            key: state.pageKey,
            child: const SignInPage(),
            transitionsBuilder:
                (context, animation, secondaryAnimation, child) {
                  return FadeTransition(
                    opacity: CurvedAnimation(
                      parent: animation,
                      curve: Curves.easeInOut,
                    ),
                    child: child,
                  );
                },
            transitionDuration: const Duration(milliseconds: 200),
          );
        },
      ),
      GoRoute(
        path: '/auth/sign-up',
        pageBuilder: (context, state) {
          return CustomTransitionPage(
            key: state.pageKey,
            child: const SignUpPage(),
            transitionsBuilder:
                (context, animation, secondaryAnimation, child) {
                  return FadeTransition(
                    opacity: CurvedAnimation(
                      parent: animation,
                      curve: Curves.easeInOut,
                    ),
                    child: child,
                  );
                },
            transitionDuration: const Duration(milliseconds: 200),
          );
        },
      ),
      GoRoute(
        path: '/auth/forgot-password',
        pageBuilder: (context, state) {
          return CustomTransitionPage(
            key: state.pageKey,
            child: const ForgotPasswordPage(),
            transitionsBuilder:
                (context, animation, secondaryAnimation, child) {
                  return FadeTransition(
                    opacity: CurvedAnimation(
                      parent: animation,
                      curve: Curves.easeInOut,
                    ),
                    child: child,
                  );
                },
            transitionDuration: const Duration(milliseconds: 200),
          );
        },
      ),
      GoRoute(
        path: '/auth/account-setup',
        pageBuilder: (context, state) {
          return CustomTransitionPage(
            key: state.pageKey,
            child: const AccountSetupPage(),
            transitionsBuilder:
                (context, animation, secondaryAnimation, child) {
                  return FadeTransition(
                    opacity: CurvedAnimation(
                      parent: animation,
                      curve: Curves.easeInOut,
                    ),
                    child: child,
                  );
                },
            transitionDuration: const Duration(milliseconds: 200),
          );
        },
      ),
      GoRoute(
        path: '/home',
        pageBuilder: (context, state) {
          return CustomTransitionPage(
            key: state.pageKey,
            child: const MainNavigationPage(),
            transitionsBuilder:
                (context, animation, secondaryAnimation, child) {
                  const begin = 0.0;
                  const end = 1.0;
                  const curve = Curves.easeIn;

                  final tween = Tween(
                    begin: begin,
                    end: end,
                  ).chain(CurveTween(curve: curve));

                  final fadeAnimation = animation.drive(tween);

                  return FadeTransition(opacity: fadeAnimation, child: child);
                },
            transitionDuration: const Duration(milliseconds: 300),
          );
        },
      ),
      GoRoute(
        path: '/account',
        pageBuilder: (context, state) {
          return CustomTransitionPage(
            key: state.pageKey,
            child: const AccountPage(),
            transitionsBuilder:
                (context, animation, secondaryAnimation, child) {
                  const begin = Offset(1.0, 0.0);
                  const end = Offset.zero;
                  const curve = Curves.ease;

                  var tween = Tween(begin: begin, end: end).chain(
                    CurveTween(curve: curve),
                  );

                  return SlideTransition(
                    position: animation.drive(tween),
                    child: child,
                  );
                },
            transitionDuration: const Duration(milliseconds: 300),
          );
        },
      ),
      GoRoute(
        path: '/account-info',
        pageBuilder: (context, state) {
          return CustomTransitionPage(
            key: state.pageKey,
            child: const AccountInfoPage(),
            transitionsBuilder:
                (context, animation, secondaryAnimation, child) {
                  const begin = Offset(1.0, 0.0);
                  const end = Offset.zero;
                  const curve = Curves.ease;

                  var tween = Tween(begin: begin, end: end).chain(
                    CurveTween(curve: curve),
                  );

                  return SlideTransition(
                    position: animation.drive(tween),
                    child: child,
                  );
                },
            transitionDuration: const Duration(milliseconds: 300),
          );
        },
      ),
      GoRoute(
        path: '/missions',
        pageBuilder: (context, state) {
          return CustomTransitionPage(
            key: state.pageKey,
            child: const MissionListPage(),
            transitionsBuilder:
                (context, animation, secondaryAnimation, child) {
                  const begin = Offset(1.0, 0.0);
                  const end = Offset.zero;
                  const curve = Curves.ease;

                  var tween = Tween(begin: begin, end: end).chain(
                    CurveTween(curve: curve),
                  );

                  return SlideTransition(
                    position: animation.drive(tween),
                    child: child,
                  );
                },
            transitionDuration: const Duration(milliseconds: 300),
          );
        },
      ),
    ],
  );
}
