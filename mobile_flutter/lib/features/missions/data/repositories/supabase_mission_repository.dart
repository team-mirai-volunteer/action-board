import 'package:mobile_flutter/core/config/supabase_config.dart';
import 'package:mobile_flutter/features/missions/domain/entities/mission.dart';
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
      final response = await _supabase
          .from('missions')
          .select()
          .eq('id', id)
          .single();

      return _missionFromJson(response);
    } catch (e) {
      throw Exception('Failed to fetch mission by id: $e');
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
      maxAchievementCount: json['max_achievement_count'] as int?,
      isFeatured: json['is_featured'] as bool? ?? false,
      isHidden: json['is_hidden'] as bool? ?? false,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }
}