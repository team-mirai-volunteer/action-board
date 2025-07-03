import 'package:mobile_flutter/features/onboarding/domain/repositories/onboarding_repository.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SharedPreferencesOnboardingRepository implements OnboardingRepository {
  static const String _acceptedTermsKey = 'accepted_terms';

  @override
  Future<bool> hasAcceptedTerms() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_acceptedTermsKey) ?? false;
  }

  @override
  Future<void> setAcceptedTerms(bool accepted) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_acceptedTermsKey, accepted);
  }
}