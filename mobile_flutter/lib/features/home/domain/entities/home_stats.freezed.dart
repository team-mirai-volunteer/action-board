// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'home_stats.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

/// @nodoc
mixin _$HomeStats {
  int get totalActions => throw _privateConstructorUsedError;
  int get totalParticipants => throw _privateConstructorUsedError;
  int get userActionPoints => throw _privateConstructorUsedError;
  int get dailyActionIncrease => throw _privateConstructorUsedError;
  int get dailyParticipantIncrease => throw _privateConstructorUsedError;

  /// Create a copy of HomeStats
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $HomeStatsCopyWith<HomeStats> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $HomeStatsCopyWith<$Res> {
  factory $HomeStatsCopyWith(HomeStats value, $Res Function(HomeStats) then) =
      _$HomeStatsCopyWithImpl<$Res, HomeStats>;
  @useResult
  $Res call({
    int totalActions,
    int totalParticipants,
    int userActionPoints,
    int dailyActionIncrease,
    int dailyParticipantIncrease,
  });
}

/// @nodoc
class _$HomeStatsCopyWithImpl<$Res, $Val extends HomeStats>
    implements $HomeStatsCopyWith<$Res> {
  _$HomeStatsCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of HomeStats
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? totalActions = null,
    Object? totalParticipants = null,
    Object? userActionPoints = null,
    Object? dailyActionIncrease = null,
    Object? dailyParticipantIncrease = null,
  }) {
    return _then(
      _value.copyWith(
            totalActions: null == totalActions
                ? _value.totalActions
                : totalActions // ignore: cast_nullable_to_non_nullable
                      as int,
            totalParticipants: null == totalParticipants
                ? _value.totalParticipants
                : totalParticipants // ignore: cast_nullable_to_non_nullable
                      as int,
            userActionPoints: null == userActionPoints
                ? _value.userActionPoints
                : userActionPoints // ignore: cast_nullable_to_non_nullable
                      as int,
            dailyActionIncrease: null == dailyActionIncrease
                ? _value.dailyActionIncrease
                : dailyActionIncrease // ignore: cast_nullable_to_non_nullable
                      as int,
            dailyParticipantIncrease: null == dailyParticipantIncrease
                ? _value.dailyParticipantIncrease
                : dailyParticipantIncrease // ignore: cast_nullable_to_non_nullable
                      as int,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$HomeStatsImplCopyWith<$Res>
    implements $HomeStatsCopyWith<$Res> {
  factory _$$HomeStatsImplCopyWith(
    _$HomeStatsImpl value,
    $Res Function(_$HomeStatsImpl) then,
  ) = __$$HomeStatsImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int totalActions,
    int totalParticipants,
    int userActionPoints,
    int dailyActionIncrease,
    int dailyParticipantIncrease,
  });
}

/// @nodoc
class __$$HomeStatsImplCopyWithImpl<$Res>
    extends _$HomeStatsCopyWithImpl<$Res, _$HomeStatsImpl>
    implements _$$HomeStatsImplCopyWith<$Res> {
  __$$HomeStatsImplCopyWithImpl(
    _$HomeStatsImpl _value,
    $Res Function(_$HomeStatsImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of HomeStats
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? totalActions = null,
    Object? totalParticipants = null,
    Object? userActionPoints = null,
    Object? dailyActionIncrease = null,
    Object? dailyParticipantIncrease = null,
  }) {
    return _then(
      _$HomeStatsImpl(
        totalActions: null == totalActions
            ? _value.totalActions
            : totalActions // ignore: cast_nullable_to_non_nullable
                  as int,
        totalParticipants: null == totalParticipants
            ? _value.totalParticipants
            : totalParticipants // ignore: cast_nullable_to_non_nullable
                  as int,
        userActionPoints: null == userActionPoints
            ? _value.userActionPoints
            : userActionPoints // ignore: cast_nullable_to_non_nullable
                  as int,
        dailyActionIncrease: null == dailyActionIncrease
            ? _value.dailyActionIncrease
            : dailyActionIncrease // ignore: cast_nullable_to_non_nullable
                  as int,
        dailyParticipantIncrease: null == dailyParticipantIncrease
            ? _value.dailyParticipantIncrease
            : dailyParticipantIncrease // ignore: cast_nullable_to_non_nullable
                  as int,
      ),
    );
  }
}

/// @nodoc

class _$HomeStatsImpl implements _HomeStats {
  const _$HomeStatsImpl({
    required this.totalActions,
    required this.totalParticipants,
    required this.userActionPoints,
    required this.dailyActionIncrease,
    required this.dailyParticipantIncrease,
  });

  @override
  final int totalActions;
  @override
  final int totalParticipants;
  @override
  final int userActionPoints;
  @override
  final int dailyActionIncrease;
  @override
  final int dailyParticipantIncrease;

  @override
  String toString() {
    return 'HomeStats(totalActions: $totalActions, totalParticipants: $totalParticipants, userActionPoints: $userActionPoints, dailyActionIncrease: $dailyActionIncrease, dailyParticipantIncrease: $dailyParticipantIncrease)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$HomeStatsImpl &&
            (identical(other.totalActions, totalActions) ||
                other.totalActions == totalActions) &&
            (identical(other.totalParticipants, totalParticipants) ||
                other.totalParticipants == totalParticipants) &&
            (identical(other.userActionPoints, userActionPoints) ||
                other.userActionPoints == userActionPoints) &&
            (identical(other.dailyActionIncrease, dailyActionIncrease) ||
                other.dailyActionIncrease == dailyActionIncrease) &&
            (identical(
                  other.dailyParticipantIncrease,
                  dailyParticipantIncrease,
                ) ||
                other.dailyParticipantIncrease == dailyParticipantIncrease));
  }

  @override
  int get hashCode => Object.hash(
    runtimeType,
    totalActions,
    totalParticipants,
    userActionPoints,
    dailyActionIncrease,
    dailyParticipantIncrease,
  );

  /// Create a copy of HomeStats
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$HomeStatsImplCopyWith<_$HomeStatsImpl> get copyWith =>
      __$$HomeStatsImplCopyWithImpl<_$HomeStatsImpl>(this, _$identity);
}

abstract class _HomeStats implements HomeStats {
  const factory _HomeStats({
    required final int totalActions,
    required final int totalParticipants,
    required final int userActionPoints,
    required final int dailyActionIncrease,
    required final int dailyParticipantIncrease,
  }) = _$HomeStatsImpl;

  @override
  int get totalActions;
  @override
  int get totalParticipants;
  @override
  int get userActionPoints;
  @override
  int get dailyActionIncrease;
  @override
  int get dailyParticipantIncrease;

  /// Create a copy of HomeStats
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$HomeStatsImplCopyWith<_$HomeStatsImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
