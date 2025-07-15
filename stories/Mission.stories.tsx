import Mission from "@/components/mission/mission";
import type { Tables } from "@/lib/types/supabase";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Mission",
  component: Mission,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Mission>;

export default meta;
type Story = StoryObj<typeof meta>;

const dummyMission: Tables<"missions"> = {
  id: "mission-1",
  slug: "mission-1",
  title:
    "ミッションタイトルです。ミッションタイトルです。ミッションタイトルです。",
  content: "これはサンプルのミッション内容です。",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-02T00:00:00Z",
  icon_url: null,
  difficulty: 1,
  event_date: null,
  max_achievement_count: null,
  required_artifact_type: "NONE",
  ogp_image_url: null,
  artifact_label: null,
  is_featured: false,
  is_hidden: false,
  featured_importance: null,
};

export const Default: Story = {
  args: {
    mission: dummyMission,
    achieved: false,
    achievementsCount: 123,
  },
};

// 日付付きミッション
const dummyMissionWithDate = {
  ...dummyMission,
  difficulty: 5,
  event_date: "2025-05-01",
};

export const WithDate: Story = {
  args: {
    mission: dummyMissionWithDate,
    achieved: false,
    achievementsCount: 123,
  },
};

export const Achieved: Story = {
  args: {
    mission: dummyMissionWithDate,
    achieved: true,
    achievementsCount: 123,
  },
};
