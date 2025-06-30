// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'onboarding_provider.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

String _$onboardingRepositoryHash() =>
    r'a81d94c69b5753b7f265d17a1730ff7c87c3e277';

/// See also [onboardingRepository].
@ProviderFor(onboardingRepository)
final onboardingRepositoryProvider =
    AutoDisposeProvider<OnboardingRepository>.internal(
      onboardingRepository,
      name: r'onboardingRepositoryProvider',
      debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
          ? null
          : _$onboardingRepositoryHash,
      dependencies: null,
      allTransitiveDependencies: null,
    );

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
typedef OnboardingRepositoryRef = AutoDisposeProviderRef<OnboardingRepository>;
String _$onboardingNotifierHash() =>
    r'9301c5c497ed84a2601d83555a1ed36c5592bef7';

/// See also [OnboardingNotifier].
@ProviderFor(OnboardingNotifier)
final onboardingNotifierProvider =
    AutoDisposeAsyncNotifierProvider<OnboardingNotifier, bool>.internal(
      OnboardingNotifier.new,
      name: r'onboardingNotifierProvider',
      debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
          ? null
          : _$onboardingNotifierHash,
      dependencies: null,
      allTransitiveDependencies: null,
    );

typedef _$OnboardingNotifier = AutoDisposeAsyncNotifier<bool>;
// ignore_for_file: type=lint
// ignore_for_file: subtype_of_sealed_class, invalid_use_of_internal_member, invalid_use_of_visible_for_testing_member, deprecated_member_use_from_same_package
