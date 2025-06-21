"use client";

import Link from "next/link";
import type React from "react";
import type { MissionArtifact } from "./types";

interface ArtifactDisplayProps {
  artifact: MissionArtifact;
}

const ImageArtifact: React.FC<{ artifact: MissionArtifact }> = ({
  artifact,
}) => (
  <div className="flex flex-row gap-2">
    <div className="w-24 h-24 flex-shrink-0 relative mb-2">
      {artifact.image_storage_path && (
        <img
          src={artifact.image_storage_path}
          alt="提出画像"
          className="w-24 h-24 object-cover rounded"
        />
      )}
    </div>
    {artifact.description && (
      <p className="text-sm mt-1 flex-1">{artifact.description}</p>
    )}
  </div>
);

const ImageWithGeolocationArtifact: React.FC<{ artifact: MissionArtifact }> = ({
  artifact,
}) => (
  <div className="flex flex-row gap-2">
    <div className="w-24 h-24 flex-shrink-0 relative mb-2">
      {artifact.image_storage_path && (
        <img
          src={artifact.image_storage_path}
          alt="提出画像"
          className="w-24 h-24 object-cover rounded"
        />
      )}
    </div>
    <div className="flex-1">
      <p className="text-xs text-gray-400">
        位置情報:{" "}
        {artifact.geolocations && artifact.geolocations.length > 0
          ? "あり"
          : "なし"}
      </p>
      {artifact.description && (
        <p className="text-sm mt-1">{artifact.description}</p>
      )}
    </div>
  </div>
);

const LinkArtifact: React.FC<{ artifact: MissionArtifact }> = ({
  artifact,
}) => (
  <div className="">
    {artifact.link_url && (
      <Link
        href={artifact.link_url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 hover:underline"
      >
        {artifact.link_url}
      </Link>
    )}
    {artifact.description && (
      <p className="text-sm mt-1">{artifact.description}</p>
    )}
  </div>
);

const TextArtifact: React.FC<{ artifact: MissionArtifact }> = ({
  artifact,
}) => (
  <div className="">
    {artifact.text_content && (
      <div className="bg-gray-50 p-3 rounded border">
        <p className="text-sm whitespace-pre-wrap">{artifact.text_content}</p>
      </div>
    )}
    {artifact.description && (
      <p className="text-sm mt-1">{artifact.description}</p>
    )}
  </div>
);

const EmailArtifact: React.FC<{ artifact: MissionArtifact }> = ({
  artifact,
}) => (
  <div className="">
    {artifact.text_content && (
      <div className="bg-gray-50 p-3 rounded border">
        <p className="text-sm whitespace-pre-wrap">{artifact.text_content}</p>
      </div>
    )}
    {artifact.description && (
      <p className="text-sm mt-1">{artifact.description}</p>
    )}
  </div>
);

const PostingArtifact: React.FC<{ artifact: MissionArtifact }> = ({
  artifact,
}) => (
  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
    <div className="flex items-center gap-2 mb-2">
      <span className="text-lg">📮</span>
      <h4 className="font-semibold text-green-800">ポスティング活動報告</h4>
    </div>
    <div className="text-sm space-y-1">
      {artifact.text_content && (
        <p>
          <span className="font-medium">内容:</span> {artifact.text_content}
        </p>
      )}
      {artifact.description && (
        <p>
          <span className="font-medium">補足:</span> {artifact.description}
        </p>
      )}
      <p className="text-green-600 font-medium">💰 ポイントを獲得しました！</p>
    </div>
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
