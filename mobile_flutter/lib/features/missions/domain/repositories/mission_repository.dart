import 'package:mobile_flutter/features/missions/domain/entities/mission.dart';

abstract class MissionRepository {
  Future<List<Mission>> getMissions();
  Future<List<Mission>> getFeaturedMissions();
  Future<Mission> getMissionById(String id);
}