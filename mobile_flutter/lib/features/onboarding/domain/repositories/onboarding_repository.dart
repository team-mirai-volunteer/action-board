abstract class OnboardingRepository {
  Future<bool> hasAcceptedTerms();
  Future<void> setAcceptedTerms(bool accepted);
}