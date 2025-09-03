import ArtifactDisplay from "@/features/mission-detail/components/artifact-display";
import type { MissionArtifact } from "@/features/mission-detail/types/detail-types";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "ArtifactDisplay",
  component: ArtifactDisplay,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ width: "420px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ArtifactDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

// 画像アーティファクトのダミーデータ
const imageArtifact: MissionArtifact = {
  id: "artifact-1",
  achievement_id: "achievement-1",
  user_id: "user-1",
  artifact_type: "IMAGE",
  image_storage_path: "https://picsum.photos/200/200?random=1",
  link_url: null,
  text_content: null,
  description:
    "これは画像アーティファクトのサンプルです。これは画像アーティファクトのサンプルです。これは画像アーティファクトのサンプルです。",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

// 位置情報付き画像アーティファクトのダミーデータ
const imageWithGeolocationArtifact: MissionArtifact = {
  id: "artifact-2",
  achievement_id: "achievement-2",
  user_id: "user-2",
  artifact_type: "IMAGE_WITH_GEOLOCATION",
  image_storage_path: "https://picsum.photos/200/200?random=2",
  link_url: null,
  text_content: null,
  description: "これは位置情報付き画像アーティファクトのサンプルです。",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  geolocations: [
    {
      id: 1,
      mission_artifact_id: "artifact-2",
      lat: 35.6762,
      lon: 139.6503,
      accuracy: 10,
      altitude: 100,
      created_at: "2024-01-01T00:00:00Z",
    },
  ],
};

// 位置情報なしの画像アーティファクト（位置情報付きタイプだが位置情報が空）
const imageWithoutGeolocationArtifact: MissionArtifact = {
  id: "artifact-3",
  achievement_id: "achievement-3",
  user_id: "user-3",
  artifact_type: "IMAGE_WITH_GEOLOCATION",
  image_storage_path: "https://picsum.photos/200/200?random=3",
  link_url: null,
  text_content: null,
  description: "位置情報付きタイプですが、位置情報がないアーティファクトです。",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  geolocations: [],
};

// リンクアーティファクトのダミーデータ
const linkArtifact: MissionArtifact = {
  id: "artifact-4",
  achievement_id: "achievement-4",
  user_id: "user-4",
  artifact_type: "LINK",
  image_storage_path: null,
  link_url: "https://example.com",
  text_content: null,
  description: "これはリンクアーティファクトのサンプルです。",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

// 説明なしのリンクアーティファクト
const linkArtifactWithoutDescription: MissionArtifact = {
  id: "artifact-5",
  achievement_id: "achievement-5",
  user_id: "user-5",
  artifact_type: "LINK",
  image_storage_path: null,
  link_url: "https://github.com/example/repository",
  text_content: null,
  description: null,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

export const ImageArtifact: Story = {
  args: {
    artifact: imageArtifact,
  },
};

export const ImageWithGeolocation: Story = {
  args: {
    artifact: imageWithGeolocationArtifact,
  },
};

export const ImageWithoutGeolocation: Story = {
  args: {
    artifact: imageWithoutGeolocationArtifact,
  },
};

export const LinkArtifact: Story = {
  args: {
    artifact: linkArtifact,
  },
};

export const LinkArtifactWithoutDescription: Story = {
  args: {
    artifact: linkArtifactWithoutDescription,
  },
};

// TEXTアーティファクトのダミーデータ
const textArtifact: MissionArtifact = {
  id: "artifact-6",
  achievement_id: "achievement-6",
  user_id: "user-6",
  artifact_type: "TEXT",
  image_storage_path: null,
  link_url: null,
  text_content:
    "これはテキストアーティファクトのサンプルです。\n\n複数行のテキストも\n正しく表示されます。\n\n・リスト形式\n・での記載も\n・可能です",
  description: "これはテキストアーティファクトのサンプルです。",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

// 説明なしのTEXTアーティファクト
const textArtifactWithoutDescription: MissionArtifact = {
  id: "artifact-7",
  achievement_id: "achievement-7",
  user_id: "user-7",
  artifact_type: "TEXT",
  image_storage_path: null,
  link_url: null,
  text_content: "短いテキストのサンプル",
  description: null,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

// 画像なしの画像アーティファクト
const imageArtifactWithoutImage: MissionArtifact = {
  id: "artifact-8",
  achievement_id: "achievement-8",
  user_id: "user-8",
  artifact_type: "IMAGE",
  image_storage_path: null,
  link_url: null,
  text_content: null,
  description: "画像がないアーティファクトです。",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

// ポスティングアーティファクトのダミーデータ
const postingArtifact: MissionArtifact = {
  id: "artifact-9",
  achievement_id: "achievement-9",
  user_id: "user-9",
  artifact_type: "POSTING",
  image_storage_path: null,
  link_url: null,
  text_content: "50枚を東京都世田谷区代田1丁目に配布",
  description: "住宅街を中心に配布しました。反応も良好でした。",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

// 説明なしのポスティングアーティファクト
const postingArtifactWithoutDescription: MissionArtifact = {
  id: "artifact-10",
  achievement_id: "achievement-10",
  user_id: "user-10",
  artifact_type: "POSTING",
  image_storage_path: null,
  link_url: null,
  text_content: "25枚を大阪府大阪市中央区に配布",
  description: null,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

export const TextArtifact: Story = {
  args: {
    artifact: textArtifact,
  },
};

export const TextArtifactWithoutDescription: Story = {
  args: {
    artifact: textArtifactWithoutDescription,
  },
};

export const ImageArtifactWithoutImage: Story = {
  args: {
    artifact: imageArtifactWithoutImage,
  },
};

export const PostingArtifact: Story = {
  args: {
    artifact: postingArtifact,
  },
};

export const PostingArtifactWithoutDescription: Story = {
  args: {
    artifact: postingArtifactWithoutDescription,
  },
};
