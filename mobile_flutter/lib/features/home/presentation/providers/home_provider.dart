import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile_flutter/features/home/data/repositories/supabase_home_repository.dart';
import 'package:mobile_flutter/features/home/domain/entities/home_stats.dart';
import 'package:mobile_flutter/features/home/domain/repositories/home_repository.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'home_provider.g.dart';

final homeRepositoryProvider = Provider<HomeRepository>((ref) {
  return SupabaseHomeRepository();
});

@riverpod
Future<HomeStats> homeStats(Ref ref) async {
  final repository = ref.watch(homeRepositoryProvider);
  return repository.getHomeStats();
}