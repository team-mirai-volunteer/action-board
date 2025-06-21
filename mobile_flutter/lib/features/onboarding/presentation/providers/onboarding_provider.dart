import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile_flutter/features/onboarding/data/repositories/shared_preferences_onboarding_repository.dart';
import 'package:mobile_flutter/features/onboarding/domain/repositories/onboarding_repository.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'onboarding_provider.g.dart';

@riverpod
OnboardingRepository onboardingRepository(Ref ref) {
  return SharedPreferencesOnboardingRepository();
}

@riverpod
class OnboardingNotifier extends _$OnboardingNotifier {
  @override
  Future<bool> build() async {
    final repository = ref.read(onboardingRepositoryProvider);
    return await repository.hasAcceptedTerms();
  }

  Future<void> acceptTerms() async {
    final repository = ref.read(onboardingRepositoryProvider);
    await repository.setAcceptedTerms(true);
    state = const AsyncValue.data(true);
  }
}