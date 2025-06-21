import 'package:freezed_annotation/freezed_annotation.dart';

part 'home_stats.freezed.dart';

@freezed
class HomeStats with _$HomeStats {
  const factory HomeStats({
    required int totalActions,
    required int totalParticipants,
    required int userActionPoints,
    required int dailyActionIncrease,
    required int dailyParticipantIncrease,
  }) = _HomeStats;
}