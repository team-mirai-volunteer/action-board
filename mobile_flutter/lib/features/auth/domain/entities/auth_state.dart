import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:mobile_flutter/features/auth/domain/entities/auth_user.dart';

part 'auth_state.freezed.dart';

@freezed
class AuthState with _$AuthState {
  const factory AuthState.initial() = AuthStateInitial;
  const factory AuthState.loading() = AuthStateLoading;
  const factory AuthState.authenticated({required AuthUser user}) = AuthStateAuthenticated;
  const factory AuthState.unauthenticated() = AuthStateUnauthenticated;
  const factory AuthState.error({required String message}) = AuthStateError;
}