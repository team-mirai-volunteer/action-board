// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'mission_provider.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

String _$missionsHash() => r'dfea9b286dab2dee3ca881fcf8cba72e7f5826b4';

/// See also [missions].
@ProviderFor(missions)
final missionsProvider = AutoDisposeFutureProvider<List<Mission>>.internal(
  missions,
  name: r'missionsProvider',
  debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
      ? null
      : _$missionsHash,
  dependencies: null,
  allTransitiveDependencies: null,
);

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
typedef MissionsRef = AutoDisposeFutureProviderRef<List<Mission>>;
String _$featuredMissionsHash() => r'21001d3b1d5ebdcaab9dd1bdf111c4c7e7ccdd7b';

/// See also [featuredMissions].
@ProviderFor(featuredMissions)
final featuredMissionsProvider =
    AutoDisposeFutureProvider<List<Mission>>.internal(
      featuredMissions,
      name: r'featuredMissionsProvider',
      debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
          ? null
          : _$featuredMissionsHash,
      dependencies: null,
      allTransitiveDependencies: null,
    );

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
typedef FeaturedMissionsRef = AutoDisposeFutureProviderRef<List<Mission>>;
String _$getMissionDetailHash() => r'77b801dc2db2f702f9a6b0bbdd8d74284bd0570c';

/// Copied from Dart SDK
class _SystemHash {
  _SystemHash._();

  static int combine(int hash, int value) {
    // ignore: parameter_assignments
    hash = 0x1fffffff & (hash + value);
    // ignore: parameter_assignments
    hash = 0x1fffffff & (hash + ((0x0007ffff & hash) << 10));
    return hash ^ (hash >> 6);
  }

  static int finish(int hash) {
    // ignore: parameter_assignments
    hash = 0x1fffffff & (hash + ((0x03ffffff & hash) << 3));
    // ignore: parameter_assignments
    hash = hash ^ (hash >> 11);
    return 0x1fffffff & (hash + ((0x00003fff & hash) << 15));
  }
}

/// See also [getMissionDetail].
@ProviderFor(getMissionDetail)
const getMissionDetailProvider = GetMissionDetailFamily();

/// See also [getMissionDetail].
class GetMissionDetailFamily extends Family<AsyncValue<Mission>> {
  /// See also [getMissionDetail].
  const GetMissionDetailFamily();

  /// See also [getMissionDetail].
  GetMissionDetailProvider call(String missionId) {
    return GetMissionDetailProvider(missionId);
  }

  @override
  GetMissionDetailProvider getProviderOverride(
    covariant GetMissionDetailProvider provider,
  ) {
    return call(provider.missionId);
  }

  static const Iterable<ProviderOrFamily>? _dependencies = null;

  @override
  Iterable<ProviderOrFamily>? get dependencies => _dependencies;

  static const Iterable<ProviderOrFamily>? _allTransitiveDependencies = null;

  @override
  Iterable<ProviderOrFamily>? get allTransitiveDependencies =>
      _allTransitiveDependencies;

  @override
  String? get name => r'getMissionDetailProvider';
}

/// See also [getMissionDetail].
class GetMissionDetailProvider extends AutoDisposeFutureProvider<Mission> {
  /// See also [getMissionDetail].
  GetMissionDetailProvider(String missionId)
    : this._internal(
        (ref) => getMissionDetail(ref as GetMissionDetailRef, missionId),
        from: getMissionDetailProvider,
        name: r'getMissionDetailProvider',
        debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
            ? null
            : _$getMissionDetailHash,
        dependencies: GetMissionDetailFamily._dependencies,
        allTransitiveDependencies:
            GetMissionDetailFamily._allTransitiveDependencies,
        missionId: missionId,
      );

  GetMissionDetailProvider._internal(
    super._createNotifier, {
    required super.name,
    required super.dependencies,
    required super.allTransitiveDependencies,
    required super.debugGetCreateSourceHash,
    required super.from,
    required this.missionId,
  }) : super.internal();

  final String missionId;

  @override
  Override overrideWith(
    FutureOr<Mission> Function(GetMissionDetailRef provider) create,
  ) {
    return ProviderOverride(
      origin: this,
      override: GetMissionDetailProvider._internal(
        (ref) => create(ref as GetMissionDetailRef),
        from: from,
        name: null,
        dependencies: null,
        allTransitiveDependencies: null,
        debugGetCreateSourceHash: null,
        missionId: missionId,
      ),
    );
  }

  @override
  AutoDisposeFutureProviderElement<Mission> createElement() {
    return _GetMissionDetailProviderElement(this);
  }

  @override
  bool operator ==(Object other) {
    return other is GetMissionDetailProvider && other.missionId == missionId;
  }

  @override
  int get hashCode {
    var hash = _SystemHash.combine(0, runtimeType.hashCode);
    hash = _SystemHash.combine(hash, missionId.hashCode);

    return _SystemHash.finish(hash);
  }
}

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
mixin GetMissionDetailRef on AutoDisposeFutureProviderRef<Mission> {
  /// The parameter `missionId` of this provider.
  String get missionId;
}

class _GetMissionDetailProviderElement
    extends AutoDisposeFutureProviderElement<Mission>
    with GetMissionDetailRef {
  _GetMissionDetailProviderElement(super.provider);

  @override
  String get missionId => (origin as GetMissionDetailProvider).missionId;
}

String _$submitMissionCompletionHash() =>
    r'04675c392f1d950ad5d7e0010303893bc36eb481';

/// See also [submitMissionCompletion].
@ProviderFor(submitMissionCompletion)
const submitMissionCompletionProvider = SubmitMissionCompletionFamily();

/// See also [submitMissionCompletion].
class SubmitMissionCompletionFamily extends Family<AsyncValue<void>> {
  /// See also [submitMissionCompletion].
  const SubmitMissionCompletionFamily();

  /// See also [submitMissionCompletion].
  SubmitMissionCompletionProvider call(MissionSubmission submission) {
    return SubmitMissionCompletionProvider(submission);
  }

  @override
  SubmitMissionCompletionProvider getProviderOverride(
    covariant SubmitMissionCompletionProvider provider,
  ) {
    return call(provider.submission);
  }

  static const Iterable<ProviderOrFamily>? _dependencies = null;

  @override
  Iterable<ProviderOrFamily>? get dependencies => _dependencies;

  static const Iterable<ProviderOrFamily>? _allTransitiveDependencies = null;

  @override
  Iterable<ProviderOrFamily>? get allTransitiveDependencies =>
      _allTransitiveDependencies;

  @override
  String? get name => r'submitMissionCompletionProvider';
}

/// See also [submitMissionCompletion].
class SubmitMissionCompletionProvider extends AutoDisposeFutureProvider<void> {
  /// See also [submitMissionCompletion].
  SubmitMissionCompletionProvider(MissionSubmission submission)
    : this._internal(
        (ref) => submitMissionCompletion(
          ref as SubmitMissionCompletionRef,
          submission,
        ),
        from: submitMissionCompletionProvider,
        name: r'submitMissionCompletionProvider',
        debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
            ? null
            : _$submitMissionCompletionHash,
        dependencies: SubmitMissionCompletionFamily._dependencies,
        allTransitiveDependencies:
            SubmitMissionCompletionFamily._allTransitiveDependencies,
        submission: submission,
      );

  SubmitMissionCompletionProvider._internal(
    super._createNotifier, {
    required super.name,
    required super.dependencies,
    required super.allTransitiveDependencies,
    required super.debugGetCreateSourceHash,
    required super.from,
    required this.submission,
  }) : super.internal();

  final MissionSubmission submission;

  @override
  Override overrideWith(
    FutureOr<void> Function(SubmitMissionCompletionRef provider) create,
  ) {
    return ProviderOverride(
      origin: this,
      override: SubmitMissionCompletionProvider._internal(
        (ref) => create(ref as SubmitMissionCompletionRef),
        from: from,
        name: null,
        dependencies: null,
        allTransitiveDependencies: null,
        debugGetCreateSourceHash: null,
        submission: submission,
      ),
    );
  }

  @override
  AutoDisposeFutureProviderElement<void> createElement() {
    return _SubmitMissionCompletionProviderElement(this);
  }

  @override
  bool operator ==(Object other) {
    return other is SubmitMissionCompletionProvider &&
        other.submission == submission;
  }

  @override
  int get hashCode {
    var hash = _SystemHash.combine(0, runtimeType.hashCode);
    hash = _SystemHash.combine(hash, submission.hashCode);

    return _SystemHash.finish(hash);
  }
}

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
mixin SubmitMissionCompletionRef on AutoDisposeFutureProviderRef<void> {
  /// The parameter `submission` of this provider.
  MissionSubmission get submission;
}

class _SubmitMissionCompletionProviderElement
    extends AutoDisposeFutureProviderElement<void>
    with SubmitMissionCompletionRef {
  _SubmitMissionCompletionProviderElement(super.provider);

  @override
  MissionSubmission get submission =>
      (origin as SubmitMissionCompletionProvider).submission;
}

// ignore_for_file: type=lint
// ignore_for_file: subtype_of_sealed_class, invalid_use_of_internal_member, invalid_use_of_visible_for_testing_member, deprecated_member_use_from_same_package
