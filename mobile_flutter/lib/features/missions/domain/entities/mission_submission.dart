import 'package:freezed_annotation/freezed_annotation.dart';

part 'mission_submission.freezed.dart';

@freezed
class MissionSubmission with _$MissionSubmission {
  const factory MissionSubmission({
    required String missionId,
    required String userId,
    required String artifactType,
    String? textContent,
    String? linkUrl,
    String? imageStoragePath,
    String? description,
    double? latitude,
    double? longitude,
    double? accuracy,
    double? altitude,
  }) = _MissionSubmission;
}