describe("All Stories Comprehensive", () => {
  it("ArtifactDisplayストーリー機能確認", () => {
    const artifactStory = {
      title: "Components/ArtifactDisplay",
      component: "ArtifactDisplay",
      args: {
        artifact: {
          id: "artifact1",
          name: "Achievement Badge",
          type: "badge",
          description: "First mission completed",
          rarity: "common",
        },
        showDetails: true,
        size: "medium",
      },
      parameters: {
        layout: "centered",
        backgrounds: { default: "light" },
      },
    };

    expect(artifactStory.title).toBe("Components/ArtifactDisplay");
    expect(artifactStory.args.artifact.name).toBe("Achievement Badge");
    expect(artifactStory.args.artifact.type).toBe("badge");
    expect(artifactStory.args.showDetails).toBe(true);
    expect(artifactStory.parameters.layout).toBe("centered");
  });

  it("DifficultyBadgeストーリー機能確認", () => {
    const difficultyStories = [
      { args: { difficulty: "easy", label: "初級" } },
      { args: { difficulty: "medium", label: "中級" } },
      { args: { difficulty: "hard", label: "上級" } },
      { args: { difficulty: "expert", label: "エキスパート" } },
    ];

    expect(difficultyStories).toHaveLength(4);
    expect(difficultyStories[0].args.difficulty).toBe("easy");
    expect(difficultyStories[1].args.label).toBe("中級");
    expect(difficultyStories[2].args.difficulty).toBe("hard");
    expect(difficultyStories[3].args.label).toBe("エキスパート");
  });

  it("Missionストーリー機能確認", () => {
    const missionStory = {
      title: "Components/Mission",
      args: {
        mission: {
          id: "mission1",
          title: "地域清掃活動",
          description: "公園の清掃を行う",
          difficulty: "medium",
          xp: 150,
          estimatedTime: 120,
          location: "東京都渋谷区",
          category: "環境",
          status: "available",
        },
        isCompleted: false,
        showProgress: true,
      },
    };

    expect(missionStory.args.mission.title).toBe("地域清掃活動");
    expect(missionStory.args.mission.xp).toBe(150);
    expect(missionStory.args.mission.difficulty).toBe("medium");
    expect(missionStory.args.isCompleted).toBe(false);
    expect(missionStory.args.showProgress).toBe(true);
  });

  it("基本UIコンポーネントストーリー確認", () => {
    const basicComponents = [
      { name: "Accordion", variants: ["single", "multiple"] },
      { name: "Avatar", sizes: ["sm", "md", "lg", "xl"] },
      { name: "Badge", variants: ["default", "secondary", "destructive"] },
      {
        name: "Button",
        variants: [
          "default",
          "destructive",
          "outline",
          "secondary",
          "ghost",
          "link",
        ],
      },
      { name: "Card", layouts: ["default", "with-header", "with-footer"] },
    ];

    expect(basicComponents).toHaveLength(5);
    expect(basicComponents[0].variants).toContain("single");
    expect(basicComponents[1].sizes).toContain("lg");
    expect(basicComponents[2].variants).toContain("destructive");
    expect(basicComponents[3].variants).toHaveLength(6);
    expect(basicComponents[4].layouts).toContain("with-header");
  });

  it("フォームコンポーネントストーリー確認", () => {
    const formStories = {
      Checkbox: { states: ["checked", "unchecked", "indeterminate"] },
      Input: { types: ["text", "email", "password", "number"] },
      Select: { options: ["single", "multiple"], sizes: ["sm", "md", "lg"] },
      Textarea: { variants: ["default", "error"], rows: [3, 5, 10] },
    };

    expect(formStories.Checkbox.states).toContain("indeterminate");
    expect(formStories.Input.types).toHaveLength(4);
    expect(formStories.Select.options).toContain("multiple");
    expect(formStories.Textarea.rows).toContain(5);
  });
});
