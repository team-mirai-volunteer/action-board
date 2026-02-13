import { checkQuizAnswers } from "@/features/mission-detail/use-cases/check-quiz-answers";
import { adminClient } from "../supabase/utils";
import {
  cleanupTestMission,
  cleanupTestQuizQuestions,
  createTestMission,
  createTestQuizQuestions,
  type TestMission,
} from "./mission-test-helpers";

describe("checkQuizAnswers ユースケース", () => {
  let testMission: TestMission;
  let questionIds: string[];

  beforeEach(async () => {
    testMission = await createTestMission({
      requiredArtifactType: "QUIZ",
      difficulty: 1,
    });
    questionIds = await createTestQuizQuestions(testMission.id);
  });

  afterEach(async () => {
    if (questionIds) {
      await cleanupTestQuizQuestions(questionIds);
    }
    if (testMission) {
      await cleanupTestMission(testMission.id);
    }
  });

  test("全問正解で合格判定される", async () => {
    // Get actual questions to know correct answers
    const { data: questions } = await adminClient
      .from("quiz_questions")
      .select("id, correct_answer")
      .in("id", questionIds)
      .order("question_order");

    expect(questions).not.toBeNull();
    expect(questions!.length).toBeGreaterThan(0);

    const answers = questions!.map((q) => ({
      questionId: q.id,
      selectedAnswer: q.correct_answer,
    }));

    const result = await checkQuizAnswers(adminClient, {
      missionId: testMission.id,
      answers,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.passed).toBe(true);
    expect(result.score).toBe(100);
    expect(result.correctAnswers).toBe(questions!.length);
    expect(result.totalQuestions).toBe(questions!.length);
  });

  test("不正解がある場合は不合格判定される", async () => {
    // Get actual questions
    const { data: questions } = await adminClient
      .from("quiz_questions")
      .select("id, correct_answer")
      .in("id", questionIds)
      .order("question_order");

    expect(questions).not.toBeNull();
    expect(questions!.length).toBeGreaterThanOrEqual(2);

    // First question correct, second question wrong
    const answers = [
      {
        questionId: questions![0].id,
        selectedAnswer: questions![0].correct_answer,
      },
      {
        questionId: questions![1].id,
        selectedAnswer: questions![1].correct_answer === 1 ? 2 : 1, // wrong answer
      },
    ];

    const result = await checkQuizAnswers(adminClient, {
      missionId: testMission.id,
      answers,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.passed).toBe(false);
    expect(result.correctAnswers).toBe(1);
    expect(result.totalQuestions).toBe(2);
    expect(result.score).toBe(50);
  });

  test("クイズ問題が設定されていないミッションはエラー", async () => {
    // Create a mission without quiz questions
    const noQuizMission = await createTestMission({
      requiredArtifactType: "QUIZ",
      difficulty: 1,
      slug: `no-quiz-${Date.now()}`,
    });

    try {
      const result = await checkQuizAnswers(adminClient, {
        missionId: noQuizMission.id,
        answers: [{ questionId: "fake-id", selectedAnswer: 1 }],
      });

      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error).toContain("クイズ問題が設定されていません");
    } finally {
      await cleanupTestMission(noQuizMission.id);
    }
  });
});
