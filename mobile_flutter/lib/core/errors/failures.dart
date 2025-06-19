import 'package:freezed_annotation/freezed_annotation.dart';

part 'failures.freezed.dart';

@freezed
class Failure with _$Failure {
  const factory Failure.server({
    required String message,
    String? code,
  }) = ServerFailure;
  
  const factory Failure.network({
    required String message,
  }) = NetworkFailure;
  
  const factory Failure.auth({
    required String message,
    String? code,
  }) = AuthFailure;
  
  const factory Failure.validation({
    required String message,
    Map<String, String>? errors,
  }) = ValidationFailure;
  
  const factory Failure.unknown({
    required String message,
  }) = UnknownFailure;
}