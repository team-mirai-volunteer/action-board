import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile_flutter/features/auth/presentation/pages/sign_in_page.dart';
import 'package:mobile_flutter/features/auth/presentation/pages/sign_up_page.dart';
import 'package:mobile_flutter/features/auth/presentation/providers/auth_provider.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'app_router.g.dart';

@riverpod
GoRouter appRouter(Ref ref) {
  final authState = ref.watch(authNotifierProvider);

  return GoRouter(
    initialLocation: '/auth/sign-in',
    redirect: (context, state) {
      final isAuthenticated = authState.maybeWhen(
        authenticated: (_) => true,
        orElse: () => false,
      );

      final isAuthRoute = state.uri.path.startsWith('/auth');

      // 認証済みでauth系ページにいる場合はホームにリダイレクト
      if (isAuthenticated && isAuthRoute) {
        return '/home';
      }

      // 未認証でauth系ページにいない場合はログインにリダイレクト
      if (!isAuthenticated && !isAuthRoute) {
        return '/auth/sign-in';
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/auth/sign-in',
        pageBuilder: (context, state) {
          return CustomTransitionPage(
            key: state.pageKey,
            child: const SignInPage(),
            transitionsBuilder: (context, animation, secondaryAnimation, child) {
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
            transitionsBuilder: (context, animation, secondaryAnimation, child) {
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
            child: const HomePage(),
            transitionsBuilder: (context, animation, secondaryAnimation, child) {
              const begin = 0.0;
              const end = 1.0;
              const curve = Curves.easeIn;

              final tween = Tween(begin: begin, end: end).chain(
                CurveTween(curve: curve),
              );

              final fadeAnimation = animation.drive(tween);

              return FadeTransition(
                opacity: fadeAnimation,
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

class HomePage extends ConsumerWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authNotifierProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('ホーム'),
        actions: [
          IconButton(
            onPressed: () {
              ref.read(authNotifierProvider.notifier).signOut();
            },
            icon: const Icon(Icons.logout),
          ),
        ],
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'ログイン成功！',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            authState.maybeWhen(
              authenticated: (user) => Column(
                children: [
                  Text('ユーザーID: ${user.id}'),
                  Text('メール: ${user.email}'),
                  if (user.fullName != null) Text('名前: ${user.fullName}'),
                ],
              ),
              orElse: () => const Text('ユーザー情報なし'),
            ),
          ],
        ),
      ),
    );
  }
}