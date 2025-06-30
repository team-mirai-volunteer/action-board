import 'package:mobile_flutter/features/missions/domain/entities/mission.dart';
import 'package:mobile_flutter/features/missions/domain/entities/mission_submission.dart';

abstract class MissionRepository {
  Future<List<Mission>> getMissions();
  Future<List<Mission>> getFeaturedMissions();
  Future<Mission> getMissionById(String id);
  Future<void> submitMission(MissionSubmission submission);
  Future<bool> checkMissionCompletion(String missionId, String userId);
}