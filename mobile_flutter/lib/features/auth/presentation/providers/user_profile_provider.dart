import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile_flutter/core/config/supabase_config.dart';
import 'package:mobile_flutter/features/auth/domain/entities/user_profile.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'user_profile_provider.g.dart';

@riverpod
Future<bool> hasUserProfile(Ref ref) async {
  final supabase = SupabaseConfig.client;
  final user = supabase.auth.currentUser;

  if (user == null) {
    return false;
  }

  try {
    final response = await supabase
        .from('private_users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

    return response != null;
  } catch (e) {
    // エラーの場合はfalseを返す
    return false;
  }
}

@riverpod
Future<void> saveUserProfile(Ref ref, Map<String, dynamic> params) async {
  final name = params['name'] as String;
  final addressPrefecture = params['addressPrefecture'] as String;
  final dateOfBirth = params['dateOfBirth'] as DateTime;
  final postcode = params['postcode'] as String;
  final xUsername = params['xUsername'] as String?;
  final avatarUrl = params['avatarUrl'] as String?;
  final supabase = SupabaseConfig.client;
  final user = supabase.auth.currentUser;

  if (user == null) {
    throw Exception('User not authenticated');
  }

  await supabase.from('private_users').insert({
    'id': user.id,
    'name': name,
    'address_prefecture': addressPrefecture,
    'date_of_birth': dateOfBirth.toIso8601String().split('T')[0],
    'postcode': postcode,
    'x_username': xUsername,
    'avatar_url': avatarUrl,
  });
}

@riverpod
Future<UserProfile?> getUserProfile(Ref ref) async {
  final supabase = SupabaseConfig.client;
  final user = supabase.auth.currentUser;
  
  if (user == null) {
    return null;
  }
  
  try {
    // private_users を取得
    final privateUserResponse = await supabase
        .from('private_users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
    
    if (privateUserResponse == null) {
      return null;
    }
    
    // user_levels を別途取得
    final userLevelResponse = await supabase
        .from('user_levels')
        .select('level, xp')
        .eq('user_id', user.id)
        .maybeSingle();
    
    // public_user_profiles から公開情報を取得
    final publicUserResponse = await supabase
        .from('public_user_profiles')
        .select('avatar_url, name')
        .eq('id', user.id)
        .maybeSingle();
    
    final level = userLevelResponse?['level'] ?? 1;
    final xp = userLevelResponse?['xp'] ?? 0;
    final avatarUrl = publicUserResponse?['avatar_url'] ?? privateUserResponse['avatar_url'];
    final displayName = publicUserResponse?['name'] ?? privateUserResponse['name'];
    
    return UserProfile(
      id: user.id,
      email: user.email ?? '',
      name: privateUserResponse['name'] ?? '',
      displayName: displayName,
      avatarUrl: avatarUrl,
      addressPrefecture: privateUserResponse['address_prefecture'] ?? '',
      dateOfBirth: DateTime.parse(privateUserResponse['date_of_birth']),
      postcode: privateUserResponse['postcode'] ?? '',
      xUsername: privateUserResponse['x_username'],
      level: level,
      xp: xp,
    );
  } catch (e) {
    throw Exception('Failed to fetch user profile: $e');
  }
}
