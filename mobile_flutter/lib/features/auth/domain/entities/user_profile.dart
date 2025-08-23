import 'package:freezed_annotation/freezed_annotation.dart';

part 'user_profile.freezed.dart';

@freezed
class UserProfile with _$UserProfile {
  const factory UserProfile({
    required String id,
    required String email,
    required String name,
    required String displayName,
    String? avatarUrl,
    required String addressPrefecture,
    required DateTime dateOfBirth,
    required String postcode,
    String? xUsername,
    required int level,
    required int xp,
  }) = _UserProfile;
}