import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile_flutter/features/missions/data/repositories/supabase_mission_repository.dart';
import 'package:mobile_flutter/features/missions/domain/entities/mission.dart';
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