// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_profile_provider.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

String _$hasUserProfileHash() => r'e9857a1ae6702252ed97e1a00a1375f3645a701d';

/// See also [hasUserProfile].
@ProviderFor(hasUserProfile)
final hasUserProfileProvider = AutoDisposeFutureProvider<bool>.internal(
  hasUserProfile,
  name: r'hasUserProfileProvider',
  debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
      ? null
      : _$hasUserProfileHash,
  dependencies: null,
  allTransitiveDependencies: null,
);

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
typedef HasUserProfileRef = AutoDisposeFutureProviderRef<bool>;
String _$saveUserProfileHash() => r'18a35490a18d7f639ca50a0702a1ae0ed1c34934';

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

/// See also [saveUserProfile].
@ProviderFor(saveUserProfile)
const saveUserProfileProvider = SaveUserProfileFamily();

/// See also [saveUserProfile].
class SaveUserProfileFamily extends Family<AsyncValue<void>> {
  /// See also [saveUserProfile].
  const SaveUserProfileFamily();

  /// See also [saveUserProfile].
  SaveUserProfileProvider call(Map<String, dynamic> params) {
    return SaveUserProfileProvider(params);
  }

  @override
  SaveUserProfileProvider getProviderOverride(
    covariant SaveUserProfileProvider provider,
  ) {
    return call(provider.params);
  }

  static const Iterable<ProviderOrFamily>? _dependencies = null;

  @override
  Iterable<ProviderOrFamily>? get dependencies => _dependencies;

  static const Iterable<ProviderOrFamily>? _allTransitiveDependencies = null;

  @override
  Iterable<ProviderOrFamily>? get allTransitiveDependencies =>
      _allTransitiveDependencies;

  @override
  String? get name => r'saveUserProfileProvider';
}

/// See also [saveUserProfile].
class SaveUserProfileProvider extends AutoDisposeFutureProvider<void> {
  /// See also [saveUserProfile].
  SaveUserProfileProvider(Map<String, dynamic> params)
    : this._internal(
        (ref) => saveUserProfile(ref as SaveUserProfileRef, params),
        from: saveUserProfileProvider,
        name: r'saveUserProfileProvider',
        debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
            ? null
            : _$saveUserProfileHash,
        dependencies: SaveUserProfileFamily._dependencies,
        allTransitiveDependencies:
            SaveUserProfileFamily._allTransitiveDependencies,
        params: params,
      );

  SaveUserProfileProvider._internal(
    super._createNotifier, {
    required super.name,
    required super.dependencies,
    required super.allTransitiveDependencies,
    required super.debugGetCreateSourceHash,
    required super.from,
    required this.params,
  }) : super.internal();

  final Map<String, dynamic> params;

  @override
  Override overrideWith(
    FutureOr<void> Function(SaveUserProfileRef provider) create,
  ) {
    return ProviderOverride(
      origin: this,
      override: SaveUserProfileProvider._internal(
        (ref) => create(ref as SaveUserProfileRef),
        from: from,
        name: null,
        dependencies: null,
        allTransitiveDependencies: null,
        debugGetCreateSourceHash: null,
        params: params,
      ),
    );
  }

  @override
  AutoDisposeFutureProviderElement<void> createElement() {
    return _SaveUserProfileProviderElement(this);
  }

  @override
  bool operator ==(Object other) {
    return other is SaveUserProfileProvider && other.params == params;
  }

  @override
  int get hashCode {
    var hash = _SystemHash.combine(0, runtimeType.hashCode);
    hash = _SystemHash.combine(hash, params.hashCode);

    return _SystemHash.finish(hash);
  }
}

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
mixin SaveUserProfileRef on AutoDisposeFutureProviderRef<void> {
  /// The parameter `params` of this provider.
  Map<String, dynamic> get params;
}

class _SaveUserProfileProviderElement
    extends AutoDisposeFutureProviderElement<void>
    with SaveUserProfileRef {
  _SaveUserProfileProviderElement(super.provider);

  @override
  Map<String, dynamic> get params => (origin as SaveUserProfileProvider).params;
}

String _$getUserProfileHash() => r'b97fe5ccb6bd7c10a1da1f04d755f7b8640fc2d8';

/// See also [getUserProfile].
@ProviderFor(getUserProfile)
final getUserProfileProvider = AutoDisposeFutureProvider<UserProfile?>.internal(
  getUserProfile,
  name: r'getUserProfileProvider',
  debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
      ? null
      : _$getUserProfileHash,
  dependencies: null,
  allTransitiveDependencies: null,
);

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
typedef GetUserProfileRef = AutoDisposeFutureProviderRef<UserProfile?>;
// ignore_for_file: type=lint
// ignore_for_file: subtype_of_sealed_class, invalid_use_of_internal_member, invalid_use_of_visible_for_testing_member, deprecated_member_use_from_same_package
