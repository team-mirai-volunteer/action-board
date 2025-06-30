import 'package:mobile_flutter/core/config/supabase_config.dart';
import 'package:mobile_flutter/features/home/domain/entities/home_stats.dart';
import 'package:mobile_flutter/features/home/domain/repositories/home_repository.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseHomeRepository implements HomeRepository {
  final SupabaseClient _supabase;

  SupabaseHomeRepository() : _supabase = SupabaseConfig.client;

  @override
  Future<HomeStats> getHomeStats() async {
    try {
      // Get total actions count from achievements table
      final totalActionsResponse = await _supabase
          .from('achievements')
          .select('id')
          .count();
      
      final totalActions = totalActionsResponse.count;

      // Get total participants count from public_user_profiles table
      final totalParticipantsResponse = await _supabase
          .from('public_user_profiles')
          .select('id')
          .count();
      
      final totalParticipants = totalParticipantsResponse.count;

      // Get user's action points (XP) if authenticated
      int userActionPoints = 0;
      final currentUser = _supabase.auth.currentUser;
      
      if (currentUser != null) {
        final userLevelResponse = await _supabase
            .from('user_levels')
            .select('xp')
            .eq('user_id', currentUser.id)
            .maybeSingle();
        
        if (userLevelResponse != null) {
          userActionPoints = userLevelResponse['xp'] as int? ?? 0;
        }
      }

      // Calculate 24 hours ago
      final twentyFourHoursAgo = DateTime.now().subtract(const Duration(hours: 24));
      
      // Get daily action increase (achievements created in last 24 hours)
      final dailyActionsResponse = await _supabase
          .from('achievements')
          .select('id')
          .gte('created_at', twentyFourHoursAgo.toIso8601String())
          .count();
      
      final dailyActionIncrease = dailyActionsResponse.count;
      
      // Get daily participant increase (users registered in last 24 hours)
      final dailyParticipantsResponse = await _supabase
          .from('public_user_profiles')
          .select('id')
          .gte('created_at', twentyFourHoursAgo.toIso8601String())
          .count();
      
      final dailyParticipantIncrease = dailyParticipantsResponse.count;

      return HomeStats(
        totalActions: totalActions,
        totalParticipants: totalParticipants,
        userActionPoints: userActionPoints,
        dailyActionIncrease: dailyActionIncrease,
        dailyParticipantIncrease: dailyParticipantIncrease,
      );
    } catch (e) {
      throw Exception('Failed to fetch home stats: $e');
    }
  }
}