import {
  groupLinksByCategory,
  transformCategoriesToYaml,
  transformMissionMainLinksToYaml,
  transformMissionQuizLinksToYaml,
  transformMissionsToYaml,
  transformQuizCategoriesToYaml,
  transformQuizQuestionsToYaml,
} from "./transforms";

describe("transformCategoriesToYaml", () => {
  it("should transform DB rows to Category YAML format", () => {
    const dbRows = [
      {
        slug: "basic",
        category_title: "基本ミッション",
        sort_no: 1,
        category_kbn: "normal",
      },
      {
        slug: "advanced",
        category_title: null,
        sort_no: 2,
        category_kbn: "special",
      },
    ];

    const result = transformCategoriesToYaml(dbRows);

    expect(result).toEqual([
      {
        slug: "basic",
        title: "基本ミッション",
        sort_no: 1,
        category_kbn: "normal",
      },
      { slug: "advanced", title: null, sort_no: 2, category_kbn: "special" },
    ]);
  });

  it("should return empty array for empty input", () => {
    expect(transformCategoriesToYaml([])).toEqual([]);
  });
});

describe("transformMissionsToYaml", () => {
  it("should transform DB rows to Mission YAML format", () => {
    const dbRows = [
      {
        slug: "mission-1",
        title: "ミッション1",
        icon_url: "https://example.com/icon.png",
        content: "テスト内容",
        difficulty: 3,
        required_artifact_type: "LINK",
        max_achievement_count: 1,
        is_featured: true,
        is_hidden: false,
        artifact_label: "URL",
        ogp_image_url: "https://example.com/ogp.png",
        event_date: "2025-01-01",
      },
    ];

    const result = transformMissionsToYaml(dbRows);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      slug: "mission-1",
      title: "ミッション1",
      icon_url: "https://example.com/icon.png",
      content: "テスト内容",
      difficulty: 3,
      required_artifact_type: "LINK",
      max_achievement_count: 1,
      is_featured: true,
      is_hidden: false,
      artifact_label: "URL",
      ogp_image_url: "https://example.com/ogp.png",
      event_date: "2025-01-01",
    });
  });

  it("should handle null optional fields", () => {
    const dbRows = [
      {
        slug: "mission-2",
        title: "ミッション2",
        icon_url: null,
        content: null,
        difficulty: 1,
        required_artifact_type: "NONE",
        max_achievement_count: null,
        is_featured: false,
        is_hidden: false,
        artifact_label: null,
        ogp_image_url: null,
        event_date: null,
      },
    ];

    const result = transformMissionsToYaml(dbRows);

    expect(result[0].icon_url).toBeNull();
    expect(result[0].content).toBeNull();
    expect(result[0].max_achievement_count).toBeNull();
  });
});

describe("groupLinksByCategory", () => {
  it("should group links by category slug", () => {
    const dbRows = [
      {
        mission_id: "m1",
        category_id: "c1",
        sort_no: 1,
        missions: { slug: "mission-a" },
        mission_category: { slug: "basic" },
      },
      {
        mission_id: "m2",
        category_id: "c1",
        sort_no: 2,
        missions: { slug: "mission-b" },
        mission_category: { slug: "basic" },
      },
      {
        mission_id: "m3",
        category_id: "c2",
        sort_no: 1,
        missions: { slug: "mission-c" },
        mission_category: { slug: "advanced" },
      },
    ];

    const result = groupLinksByCategory(dbRows);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      category_slug: "basic",
      missions: [
        { mission_slug: "mission-a", sort_no: 1 },
        { mission_slug: "mission-b", sort_no: 2 },
      ],
    });
    expect(result[1]).toEqual({
      category_slug: "advanced",
      missions: [{ mission_slug: "mission-c", sort_no: 1 }],
    });
  });

  it("should return empty array for empty input", () => {
    expect(groupLinksByCategory([])).toEqual([]);
  });
});

describe("transformQuizCategoriesToYaml", () => {
  it("should transform DB rows to QuizCategory YAML format", () => {
    const dbRows = [
      {
        slug: "politics",
        name: "政治",
        description: "政治に関するクイズ",
        display_order: 1,
        is_active: true,
      },
      {
        slug: "economy",
        name: "経済",
        description: null,
        display_order: 2,
        is_active: false,
      },
    ];

    const result = transformQuizCategoriesToYaml(dbRows);

    expect(result).toEqual([
      {
        slug: "politics",
        name: "政治",
        description: "政治に関するクイズ",
        display_order: 1,
        is_active: true,
      },
      {
        slug: "economy",
        name: "経済",
        description: null,
        display_order: 2,
        is_active: false,
      },
    ]);
  });
});

describe("transformQuizQuestionsToYaml", () => {
  it("should transform DB rows with joined relations to QuizQuestion YAML format", () => {
    const dbRows = [
      {
        id: "q1",
        quiz_categories: { slug: "politics" },
        missions: { slug: "mission-1" },
        question: "質問1",
        option1: "選択肢1",
        option2: "選択肢2",
        option3: "選択肢3",
        option4: "選択肢4",
        correct_answer: 2,
        explanation: "解説文",
        question_order: 1,
        is_active: true,
      },
    ];

    const result = transformQuizQuestionsToYaml(dbRows);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: "q1",
      category_slug: "politics",
      mission_slug: "mission-1",
      question: "質問1",
      option1: "選択肢1",
      option2: "選択肢2",
      option3: "選択肢3",
      option4: "選択肢4",
      correct_answer: 2,
      explanation: "解説文",
      question_order: 1,
      is_active: true,
    });
  });

  it("should handle null mission reference", () => {
    const dbRows = [
      {
        id: "q2",
        quiz_categories: { slug: "economy" },
        missions: null,
        question: "質問2",
        option1: "A",
        option2: "B",
        option3: "C",
        option4: "D",
        correct_answer: 1,
        explanation: null,
        question_order: null,
        is_active: true,
      },
    ];

    const result = transformQuizQuestionsToYaml(dbRows);

    expect(result[0].mission_slug).toBeNull();
    expect(result[0].explanation).toBeNull();
  });
});

describe("transformMissionQuizLinksToYaml", () => {
  it("should transform DB rows to MissionQuizLink YAML format", () => {
    const dbRows = [
      {
        missions: { slug: "mission-quiz" },
        link: "https://example.com/quiz",
        remark: "テスト用",
        display_order: 1,
      },
      {
        missions: { slug: "mission-quiz-2" },
        link: "https://example.com/quiz2",
        remark: null,
        display_order: 2,
      },
    ];

    const result = transformMissionQuizLinksToYaml(dbRows);

    expect(result).toEqual([
      {
        mission_slug: "mission-quiz",
        link: "https://example.com/quiz",
        remark: "テスト用",
        display_order: 1,
      },
      {
        mission_slug: "mission-quiz-2",
        link: "https://example.com/quiz2",
        remark: null,
        display_order: 2,
      },
    ]);
  });
});

describe("transformMissionMainLinksToYaml", () => {
  it("should transform DB rows to MissionMainLink YAML format", () => {
    const dbRows = [
      {
        missions: { slug: "mission-main" },
        label: "公式サイト",
        link: "https://example.com",
      },
    ];

    const result = transformMissionMainLinksToYaml(dbRows);

    expect(result).toEqual([
      {
        mission_slug: "mission-main",
        label: "公式サイト",
        link: "https://example.com",
      },
    ]);
  });

  it("should return empty array for empty input", () => {
    expect(transformMissionMainLinksToYaml([])).toEqual([]);
  });
});
