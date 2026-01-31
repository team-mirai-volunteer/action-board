export const ARTIFACT_TYPES = {
  LINK: {
    key: "LINK",
    displayName: "リンク",
    prompt: "成果物のURLを入力してください。",
    validationRegex: /^https?:\/\/.+/,
  },
  TEXT: {
    key: "TEXT",
    displayName: "テキスト",
    prompt: "成果物のテキストを入力してください。",
  },
  EMAIL: {
    key: "EMAIL",
    displayName: "メールアドレス",
    prompt: "成果物のメールアドレスを入力してください。",
    validationRegex: /^[\w!#$%&'*+/=?`{|}~^.-]+@[\w.-]+\.[a-zA-Z]{2,}$/,
  },
  IMAGE: {
    key: "IMAGE",
    displayName: "画像",
    prompt: "画像の添付が必要です。",
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    maxFileSizeMB: 10,
  },
  IMAGE_WITH_GEOLOCATION: {
    key: "IMAGE_WITH_GEOLOCATION",
    displayName: "画像および位置情報",
    prompt: "画像の添付と位置情報の設定が必要です。",
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    maxFileSizeMB: 10,
  },
  REFERRAL: {
    key: "REFERRAL",
    displayName: "紹介ミッション",
    prompt: "このミッションでは紹介が完了すると自動で達成されます。",
  },
  POSTING: {
    key: "POSTING",
    displayName: "ポスティング",
    prompt: "ポスティングした枚数と場所を入力してください。",
  },
  POSTER: {
    key: "POSTER",
    displayName: "選挙区ポスター",
    prompt: "選挙区ポスターを貼った枚数を入力してください。",
  },
  QUIZ: {
    key: "QUIZ",
    displayName: "クイズ",
    prompt: "クイズに正解してミッションを達成しましょう。",
  },
  LINK_ACCESS: {
    key: "LINK_ACCESS",
    displayName: "リンクアクセス",
    prompt: "リンクをクリックするとミッションが達成されます。",
  },
  YOUTUBE: {
    key: "YOUTUBE",
    displayName: "YouTube",
    prompt:
      "YouTubeでチームみらい動画に高評価をつけて、自動または手動で記録しましょう。",
    validationRegex:
      /^https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/|live\/)|youtu\.be\/)[\w-]+(?:[?&#].*)?$/,
  },
  YOUTUBE_COMMENT: {
    key: "YOUTUBE_COMMENT",
    displayName: "YouTubeコメント",
    prompt: "YouTubeでチームみらい動画にコメントして、自動で記録しましょう。",
  },
  NONE: {
    key: "NONE",
    displayName: "添付データ不要",
    prompt: "このミッションでは添付データの投稿は不要です。",
  },
} as const;

export type ArtifactTypeKey = keyof typeof ARTIFACT_TYPES;

export type ArtifactConfig = (typeof ARTIFACT_TYPES)[ArtifactTypeKey];

export function getArtifactConfig(
  typeKey: ArtifactTypeKey | string | undefined | null,
): ArtifactConfig | undefined {
  if (!typeKey || !Object.keys(ARTIFACT_TYPES).includes(typeKey)) {
    // 不明なタイプやNONEの場合は、NONEの設定を返すか、undefinedを返す
    // ここではNONEをデフォルトとして扱う
    return ARTIFACT_TYPES.NONE;
  }
  return ARTIFACT_TYPES[typeKey as ArtifactTypeKey];
}

// ミッションの required_artifact_type に保存する値の型
export type MissionRequiredArtifactType =
  | ArtifactTypeKey
  | "LINK"
  | "TEXT"
  | "EMAIL"
  | "IMAGE"
  | "IMAGE_WITH_GEOLOCATION"
  | "REFERRAL"
  | "POSTING"
  | "POSTER"
  | "YOUTUBE"
  | "YOUTUBE_COMMENT"
  | "NONE";
