import 'package:mobile_flutter/core/config/supabase_config.dart';
import 'package:mobile_flutter/features/missions/domain/entities/mission.dart';
import 'package:mobile_flutter/features/missions/domain/entities/mission_submission.dart';
import 'package:mobile_flutter/features/missions/domain/repositories/mission_repository.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseMissionRepository implements MissionRepository {
  final SupabaseClient _supabase;

  SupabaseMissionRepository() : _supabase = SupabaseConfig.client;

  @override
  Future<List<Mission>> getMissions() async {
    try {
      final response = await _supabase
          .from('missions')
          .select()
          .eq('is_hidden', false)
          .order('created_at', ascending: false);

      return (response as List)
          .map((json) => _missionFromJson(json))
          .toList();
    } catch (e) {
      throw Exception('Failed to fetch missions: $e');
    }
  }

  @override
  Future<List<Mission>> getFeaturedMissions() async {
    try {
      final response = await _supabase
          .from('missions')
          .select()
          .eq('is_hidden', false)
          .eq('is_featured', true)
          .order('created_at', ascending: false);

      return (response as List)
          .map((json) => _missionFromJson(json))
          .toList();
    } catch (e) {
      throw Exception('Failed to fetch featured missions: $e');
    }
  }

  @override
  Future<Mission> getMissionById(String id) async {
    try {
      final user = _supabase.auth.currentUser;
      
      // Get mission
      final missionResponse = await _supabase
          .from('missions')
          .select()
          .eq('id', id)
          .single();
      
      final mission = _missionFromJson(missionResponse);
      
      // Check if user has completed this mission
      bool isCompleted = false;
      if (user != null) {
        isCompleted = await checkMissionCompletion(id, user.id);
      }
      
      // Get achievement count separately
      final countResponse = await _supabase
          .from('mission_achievement_count_view')
          .select('achievement_count')
          .eq('mission_id', id)
          .maybeSingle();
      
      final achievementCount = countResponse?['achievement_count'] ?? 0;
      
      return mission.copyWith(
        achievementCount: achievementCount as int,
        isCompleted: isCompleted,
      );
    } catch (e) {
      throw Exception('Failed to fetch mission by id: $e');
    }
  }

  @override
  Future<void> submitMission(MissionSubmission submission) async {
    try {
      final user = _supabase.auth.currentUser;
      if (user == null) {
        throw Exception('User not authenticated');
      }
      
      // Create achievement record
      final achievementResponse = await _supabase
          .from('achievements')
          .insert({
            'mission_id': submission.missionId,
            'user_id': submission.userId,
          })
          .select()
          .single();
      
      // Create mission artifact
      final artifactData = {
        'achievement_id': achievementResponse['id'],
        'user_id': submission.userId,
        'artifact_type': submission.artifactType,
        'text_content': submission.textContent,
        'link_url': submission.linkUrl,
        'image_storage_path': submission.imageStoragePath,
        'description': submission.description,
      };
      
      final artifactResponse = await _supabase
          .from('mission_artifacts')
          .insert(artifactData)
          .select()
          .single();
      
      // If location data is provided, save it
      if (submission.latitude != null && submission.longitude != null) {
        await _supabase
            .from('mission_artifact_geolocations')
            .insert({
              'mission_artifact_id': artifactResponse['id'],
              'lat': submission.latitude,
              'lon': submission.longitude,
              'accuracy': submission.accuracy,
              'altitude': submission.altitude,
            });
      }
    } catch (e) {
      throw Exception('Failed to submit mission: $e');
    }
  }
  
  @override
  Future<bool> checkMissionCompletion(String missionId, String userId) async {
    try {
      final response = await _supabase
          .from('achievements')
          .select('id')
          .eq('mission_id', missionId)
          .eq('user_id', userId)
          .maybeSingle();
      
      return response != null;
    } catch (e) {
      throw Exception('Failed to check mission completion: $e');
    }
  }

  Mission _missionFromJson(Map<String, dynamic> json) {
    return Mission(
      id: json['id'] as String,
      title: json['title'] as String,
      iconUrl: json['icon_url'] as String?,
      content: json['content'] as String?,
      difficulty: json['difficulty'] as int,
      eventDate: json['event_date'] != null 
          ? DateTime.parse(json['event_date'] as String)
          : null,
      requiredArtifactType: json['required_artifact_type'] as String,
      artifactLabel: json['artifact_label'] as String?,
      ogpImageUrl: json['ogp_image_url'] as String?,
      maxAchievementCount: json['max_achievement_count'] as int?,
      isFeatured: json['is_featured'] as bool? ?? false,
      isHidden: json['is_hidden'] as bool? ?? false,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }
}