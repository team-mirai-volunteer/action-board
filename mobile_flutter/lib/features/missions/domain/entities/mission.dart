import 'package:freezed_annotation/freezed_annotation.dart';

part 'mission.freezed.dart';

@freezed
class Mission with _$Mission {
  const factory Mission({
    required String id,
    required String title,
    String? iconUrl,
    String? content,
    required int difficulty,
    DateTime? eventDate,
    required String requiredArtifactType,
    int? maxAchievementCount,
    @Default(false) bool isFeatured,
    @Default(false) bool isHidden,
    required DateTime createdAt,
    required DateTime updatedAt,
  }) = _Mission;
}