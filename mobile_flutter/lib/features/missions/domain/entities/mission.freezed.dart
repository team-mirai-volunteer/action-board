// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'mission.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

/// @nodoc
mixin _$Mission {
  String get id => throw _privateConstructorUsedError;
  String get title => throw _privateConstructorUsedError;
  String? get iconUrl => throw _privateConstructorUsedError;
  String? get content => throw _privateConstructorUsedError;
  int get difficulty => throw _privateConstructorUsedError;
  DateTime? get eventDate => throw _privateConstructorUsedError;
  String get requiredArtifactType => throw _privateConstructorUsedError;
  int? get maxAchievementCount => throw _privateConstructorUsedError;
  bool get isFeatured => throw _privateConstructorUsedError;
  bool get isHidden => throw _privateConstructorUsedError;
  DateTime get createdAt => throw _privateConstructorUsedError;
  DateTime get updatedAt => throw _privateConstructorUsedError;

  /// Create a copy of Mission
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $MissionCopyWith<Mission> get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $MissionCopyWith<$Res> {
  factory $MissionCopyWith(Mission value, $Res Function(Mission) then) =
      _$MissionCopyWithImpl<$Res, Mission>;
  @useResult
  $Res call({
    String id,
    String title,
    String? iconUrl,
    String? content,
    int difficulty,
    DateTime? eventDate,
    String requiredArtifactType,
    int? maxAchievementCount,
    bool isFeatured,
    bool isHidden,
    DateTime createdAt,
    DateTime updatedAt,
  });
}

/// @nodoc
class _$MissionCopyWithImpl<$Res, $Val extends Mission>
    implements $MissionCopyWith<$Res> {
  _$MissionCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of Mission
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? title = null,
    Object? iconUrl = freezed,
    Object? content = freezed,
    Object? difficulty = null,
    Object? eventDate = freezed,
    Object? requiredArtifactType = null,
    Object? maxAchievementCount = freezed,
    Object? isFeatured = null,
    Object? isHidden = null,
    Object? createdAt = null,
    Object? updatedAt = null,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as String,
            title: null == title
                ? _value.title
                : title // ignore: cast_nullable_to_non_nullable
                      as String,
            iconUrl: freezed == iconUrl
                ? _value.iconUrl
                : iconUrl // ignore: cast_nullable_to_non_nullable
                      as String?,
            content: freezed == content
                ? _value.content
                : content // ignore: cast_nullable_to_non_nullable
                      as String?,
            difficulty: null == difficulty
                ? _value.difficulty
                : difficulty // ignore: cast_nullable_to_non_nullable
                      as int,
            eventDate: freezed == eventDate
                ? _value.eventDate
                : eventDate // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            requiredArtifactType: null == requiredArtifactType
                ? _value.requiredArtifactType
                : requiredArtifactType // ignore: cast_nullable_to_non_nullable
                      as String,
            maxAchievementCount: freezed == maxAchievementCount
                ? _value.maxAchievementCount
                : maxAchievementCount // ignore: cast_nullable_to_non_nullable
                      as int?,
            isFeatured: null == isFeatured
                ? _value.isFeatured
                : isFeatured // ignore: cast_nullable_to_non_nullable
                      as bool,
            isHidden: null == isHidden
                ? _value.isHidden
                : isHidden // ignore: cast_nullable_to_non_nullable
                      as bool,
            createdAt: null == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                      as DateTime,
            updatedAt: null == updatedAt
                ? _value.updatedAt
                : updatedAt // ignore: cast_nullable_to_non_nullable
                      as DateTime,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$MissionImplCopyWith<$Res> implements $MissionCopyWith<$Res> {
  factory _$$MissionImplCopyWith(
    _$MissionImpl value,
    $Res Function(_$MissionImpl) then,
  ) = __$$MissionImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    String title,
    String? iconUrl,
    String? content,
    int difficulty,
    DateTime? eventDate,
    String requiredArtifactType,
    int? maxAchievementCount,
    bool isFeatured,
    bool isHidden,
    DateTime createdAt,
    DateTime updatedAt,
  });
}

/// @nodoc
class __$$MissionImplCopyWithImpl<$Res>
    extends _$MissionCopyWithImpl<$Res, _$MissionImpl>
    implements _$$MissionImplCopyWith<$Res> {
  __$$MissionImplCopyWithImpl(
    _$MissionImpl _value,
    $Res Function(_$MissionImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of Mission
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? title = null,
    Object? iconUrl = freezed,
    Object? content = freezed,
    Object? difficulty = null,
    Object? eventDate = freezed,
    Object? requiredArtifactType = null,
    Object? maxAchievementCount = freezed,
    Object? isFeatured = null,
    Object? isHidden = null,
    Object? createdAt = null,
    Object? updatedAt = null,
  }) {
    return _then(
      _$MissionImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        title: null == title
            ? _value.title
            : title // ignore: cast_nullable_to_non_nullable
                  as String,
        iconUrl: freezed == iconUrl
            ? _value.iconUrl
            : iconUrl // ignore: cast_nullable_to_non_nullable
                  as String?,
        content: freezed == content
            ? _value.content
            : content // ignore: cast_nullable_to_non_nullable
                  as String?,
        difficulty: null == difficulty
            ? _value.difficulty
            : difficulty // ignore: cast_nullable_to_non_nullable
                  as int,
        eventDate: freezed == eventDate
            ? _value.eventDate
            : eventDate // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        requiredArtifactType: null == requiredArtifactType
            ? _value.requiredArtifactType
            : requiredArtifactType // ignore: cast_nullable_to_non_nullable
                  as String,
        maxAchievementCount: freezed == maxAchievementCount
            ? _value.maxAchievementCount
            : maxAchievementCount // ignore: cast_nullable_to_non_nullable
                  as int?,
        isFeatured: null == isFeatured
            ? _value.isFeatured
            : isFeatured // ignore: cast_nullable_to_non_nullable
                  as bool,
        isHidden: null == isHidden
            ? _value.isHidden
            : isHidden // ignore: cast_nullable_to_non_nullable
                  as bool,
        createdAt: null == createdAt
            ? _value.createdAt
            : createdAt // ignore: cast_nullable_to_non_nullable
                  as DateTime,
        updatedAt: null == updatedAt
            ? _value.updatedAt
            : updatedAt // ignore: cast_nullable_to_non_nullable
                  as DateTime,
      ),
    );
  }
}

/// @nodoc

class _$MissionImpl implements _Mission {
  const _$MissionImpl({
    required this.id,
    required this.title,
    this.iconUrl,
    this.content,
    required this.difficulty,
    this.eventDate,
    required this.requiredArtifactType,
    this.maxAchievementCount,
    this.isFeatured = false,
    this.isHidden = false,
    required this.createdAt,
    required this.updatedAt,
  });

  @override
  final String id;
  @override
  final String title;
  @override
  final String? iconUrl;
  @override
  final String? content;
  @override
  final int difficulty;
  @override
  final DateTime? eventDate;
  @override
  final String requiredArtifactType;
  @override
  final int? maxAchievementCount;
  @override
  @JsonKey()
  final bool isFeatured;
  @override
  @JsonKey()
  final bool isHidden;
  @override
  final DateTime createdAt;
  @override
  final DateTime updatedAt;

  @override
  String toString() {
    return 'Mission(id: $id, title: $title, iconUrl: $iconUrl, content: $content, difficulty: $difficulty, eventDate: $eventDate, requiredArtifactType: $requiredArtifactType, maxAchievementCount: $maxAchievementCount, isFeatured: $isFeatured, isHidden: $isHidden, createdAt: $createdAt, updatedAt: $updatedAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$MissionImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.title, title) || other.title == title) &&
            (identical(other.iconUrl, iconUrl) || other.iconUrl == iconUrl) &&
            (identical(other.content, content) || other.content == content) &&
            (identical(other.difficulty, difficulty) ||
                other.difficulty == difficulty) &&
            (identical(other.eventDate, eventDate) ||
                other.eventDate == eventDate) &&
            (identical(other.requiredArtifactType, requiredArtifactType) ||
                other.requiredArtifactType == requiredArtifactType) &&
            (identical(other.maxAchievementCount, maxAchievementCount) ||
                other.maxAchievementCount == maxAchievementCount) &&
            (identical(other.isFeatured, isFeatured) ||
                other.isFeatured == isFeatured) &&
            (identical(other.isHidden, isHidden) ||
                other.isHidden == isHidden) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt));
  }

  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    title,
    iconUrl,
    content,
    difficulty,
    eventDate,
    requiredArtifactType,
    maxAchievementCount,
    isFeatured,
    isHidden,
    createdAt,
    updatedAt,
  );

  /// Create a copy of Mission
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$MissionImplCopyWith<_$MissionImpl> get copyWith =>
      __$$MissionImplCopyWithImpl<_$MissionImpl>(this, _$identity);
}

abstract class _Mission implements Mission {
  const factory _Mission({
    required final String id,
    required final String title,
    final String? iconUrl,
    final String? content,
    required final int difficulty,
    final DateTime? eventDate,
    required final String requiredArtifactType,
    final int? maxAchievementCount,
    final bool isFeatured,
    final bool isHidden,
    required final DateTime createdAt,
    required final DateTime updatedAt,
  }) = _$MissionImpl;

  @override
  String get id;
  @override
  String get title;
  @override
  String? get iconUrl;
  @override
  String? get content;
  @override
  int get difficulty;
  @override
  DateTime? get eventDate;
  @override
  String get requiredArtifactType;
  @override
  int? get maxAchievementCount;
  @override
  bool get isFeatured;
  @override
  bool get isHidden;
  @override
  DateTime get createdAt;
  @override
  DateTime get updatedAt;

  /// Create a copy of Mission
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$MissionImplCopyWith<_$MissionImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
