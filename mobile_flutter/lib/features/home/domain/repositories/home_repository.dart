import 'package:mobile_flutter/features/home/domain/entities/home_stats.dart';

abstract class HomeRepository {
  Future<HomeStats> getHomeStats();
}