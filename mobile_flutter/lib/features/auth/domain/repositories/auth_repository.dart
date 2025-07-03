import 'package:mobile_flutter/features/auth/domain/entities/auth_user.dart';

abstract class AuthRepository {
  Future<AuthUser?> getCurrentUser();
  Future<AuthUser> signInWithEmailPassword({
    required String email,
    required String password,
  });
  Future<AuthUser> signUpWithEmailPassword({
    required String email,
    required String password,
    required String dateOfBirth,
  });
  Future<void> signOut();
  Future<void> resetPassword(String email);
  Stream<AuthUser?> get authStateChanges;
}