import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile_flutter/features/missions/data/repositories/supabase_mission_repository.dart';
import 'package:mobile_flutter/features/missions/domain/entities/mission.dart';
import 'package:mobile_flutter/features/missions/domain/entities/mission_submission.dart';
import 'package:mobile_flutter/features/missions/domain/repositories/mission_repository.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'mission_provider.g.dart';

final missionRepositoryProvider = Provider<MissionRepository>((ref) {
  return SupabaseMissionRepository();
});

@riverpod
Future<List<Mission>> missions(Ref ref) async {
  final repository = ref.watch(missionRepositoryProvider);
  return repository.getMissions();
}

@riverpod
Future<List<Mission>> featuredMissions(Ref ref) async {
  final repository = ref.watch(missionRepositoryProvider);
  return repository.getFeaturedMissions();
}

@riverpod
Future<Mission> getMissionDetail(Ref ref, String missionId) async {
  final repository = ref.read(missionRepositoryProvider);
  return repository.getMissionById(missionId);
}

@riverpod
Future<void> submitMissionCompletion(Ref ref, MissionSubmission submission) async {
  final repository = ref.read(missionRepositoryProvider);
  await repository.submitMission(submission);
  
  // Invalidate the mission detail to refresh completion status
  ref.invalidate(getMissionDetailProvider(submission.missionId));
}