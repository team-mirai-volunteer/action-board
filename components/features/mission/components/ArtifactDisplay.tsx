"use client";

import type { MissionArtifact } from "@/lib/types/domain";
import Link from "next/link";
import type React from "react";

interface ArtifactDisplayProps {
  artifact: MissionArtifact;
}

const ImageArtifact: React.FC<{ artifact: MissionArtifact }> = ({
  artifact,
}) => (
  <div className="space-y-2">
    <div className="relative">
      <img
        src={artifact.image_storage_path || ""}
        alt="投稿画像"
        className="w-full max-w-md rounded-lg shadow-sm"
      />
    </div>
    {artifact.description && (
      <p className="text-sm text-gray-600">{artifact.description}</p>
    )}
  </div>
);

const ImageWithGeolocationArtifact: React.FC<{ artifact: MissionArtifact }> = ({
  artifact,
}) => (
  <div className="space-y-2">
    <div className="relative">
      <img
        src={artifact.image_storage_path || ""}
        alt="位置情報付き投稿画像"
        className="w-full max-w-md rounded-lg shadow-sm"
      />
    </div>
    {artifact.description && (
      <p className="text-sm text-gray-600">{artifact.description}</p>
    )}
    {/* 位置情報は別テーブル(mission_artifact_geolocations)から取得する必要があります */}
  </div>
);

const LinkArtifact: React.FC<{ artifact: MissionArtifact }> = ({
  artifact,
}) => (
  <div className="space-y-2">
    {artifact.link_url && (
      <Link
        href={artifact.link_url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 underline break-all"
      >
        {artifact.link_url}
      </Link>
    )}
    {artifact.description && (
      <p className="text-sm text-gray-600">{artifact.description}</p>
    )}
  </div>
);

const TextArtifact: React.FC<{ artifact: MissionArtifact }> = ({
  artifact,
}) => (
  <div className="space-y-2">
    {artifact.description && (
      <p className="text-sm text-gray-700 whitespace-pre-wrap">
        {artifact.description}
      </p>
    )}
  </div>
);

const EmailArtifact: React.FC<{ artifact: MissionArtifact }> = ({
  artifact,
}) => (
  <div className="space-y-2">
    {/* emailプロパティは存在しません - text_contentを使用 */}
    {artifact.text_content && (
      <div className="text-sm">
        <span className="font-medium">内容: </span>
        <span className="text-gray-700">{artifact.text_content}</span>
      </div>
    )}
    {artifact.description && (
      <p className="text-sm text-gray-600">{artifact.description}</p>
    )}
  </div>
);

const PostingArtifact: React.FC<{ artifact: MissionArtifact }> = ({
  artifact,
}) => (
  <div className="space-y-2">
    {artifact.image_storage_path && (
      <div className="relative">
        <img
          src={artifact.image_storage_path}
          alt="ポスティング画像"
          className="w-full max-w-md rounded-lg shadow-sm"
        />
      </div>
    )}
    {artifact.description && (
      <p className="text-sm text-gray-600">{artifact.description}</p>
    )}
    {/* 位置情報は別テーブル(mission_artifact_geolocations)から取得する必要があります */}
  </div>
);

const ArtifactDisplay: React.FC<ArtifactDisplayProps> = ({ artifact }) => {
  switch (artifact.artifact_type) {
    case "IMAGE":
      return <ImageArtifact artifact={artifact} />;
    case "IMAGE_WITH_GEOLOCATION":
      return <ImageWithGeolocationArtifact artifact={artifact} />;
    case "LINK":
      return <LinkArtifact artifact={artifact} />;
    case "TEXT":
      return <TextArtifact artifact={artifact} />;
    case "EMAIL":
      return <EmailArtifact artifact={artifact} />;
    case "POSTING":
      return <PostingArtifact artifact={artifact} />;
    default:
      return null;
  }
};

export default ArtifactDisplay;
