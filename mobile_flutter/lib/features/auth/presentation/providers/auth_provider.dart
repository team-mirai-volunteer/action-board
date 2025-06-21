import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile_flutter/features/auth/data/repositories/supabase_auth_repository.dart';
import 'package:mobile_flutter/features/auth/domain/entities/auth_state.dart';
import 'package:mobile_flutter/features/auth/domain/repositories/auth_repository.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'auth_provider.g.dart';

@riverpod
AuthRepository authRepository(Ref ref) {
  return SupabaseAuthRepository();
}

@riverpod
class AuthNotifier extends _$AuthNotifier {
  @override
  AuthState build() {
    _initialize();
    return const AuthState.initial();
  }

  void _initialize() {
    final repository = ref.read(authRepositoryProvider);
    
    // Listen to auth state changes
    repository.authStateChanges.listen((user) {
      if (user != null) {
        state = AuthState.authenticated(user: user);
      } else {
        state = const AuthState.unauthenticated();
      }
    });
    
    // Check current user
    _checkCurrentUser();
  }

  Future<void> _checkCurrentUser() async {
    try {
      state = const AuthState.loading();
      final repository = ref.read(authRepositoryProvider);
      final user = await repository.getCurrentUser();
      
      if (user != null) {
        state = AuthState.authenticated(user: user);
      } else {
        state = const AuthState.unauthenticated();
      }
    } catch (e) {
      state = AuthState.error(message: e.toString());
    }
  }

  Future<void> signInWithEmailPassword({
    required String email,
    required String password,
  }) async {
    try {
      state = const AuthState.loading();
      final repository = ref.read(authRepositoryProvider);
      final user = await repository.signInWithEmailPassword(
        email: email,
        password: password,
      );
      state = AuthState.authenticated(user: user);
    } catch (e) {
      state = AuthState.error(message: e.toString());
    }
  }

  Future<void> signUpWithEmailPassword({
    required String email,
    required String password,
  }) async {
    try {
      state = const AuthState.loading();
      final repository = ref.read(authRepositoryProvider);
      final user = await repository.signUpWithEmailPassword(
        email: email,
        password: password,
      );
      state = AuthState.authenticated(user: user);
    } catch (e) {
      state = AuthState.error(message: e.toString());
    }
  }

  Future<void> signOut() async {
    try {
      state = const AuthState.loading();
      final repository = ref.read(authRepositoryProvider);
      await repository.signOut();
      state = const AuthState.unauthenticated();
    } catch (e) {
      state = AuthState.error(message: e.toString());
    }
  }

  Future<void> resetPassword(String email) async {
    try {
      final repository = ref.read(authRepositoryProvider);
      await repository.resetPassword(email);
    } catch (e) {
      throw Exception('Password reset failed: $e');
    }
  }
}