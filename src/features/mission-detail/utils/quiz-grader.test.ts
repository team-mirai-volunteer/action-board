import {
  gradeQuizAnswers,
  type QuizAnswer,
  type QuizQuestion,
  type QuizQuestionRow,
  transformQuizRow,
} from "./quiz-grader";

describe("quiz-grader", () => {
  describe("transformQuizRow", () => {
    it("正常なDBの行データをQuizQuestion型に変換する", () => {
      const row: QuizQuestionRow = {
        id: "q1",
        question: "日本の首都は？",
        option1: "大阪",
        option2: "東京",
        option3: "京都",
        option4: "名古屋",
        correct_answer: 2,
        explanation: "東京が日本の首都です",
        quiz_categories: { name: "地理" },
      };

      const result = transformQuizRow(row);

      expect(result).toEqual({
        id: "q1",
        question: "日本の首都は？",
        options: ["大阪", "東京", "京都", "名古屋"],
        correct_answer: 2,
        explanation: "東京が日本の首都です",
        category: "地理",
      });
    });

    it("quiz_categoriesが配列の場合、最初のカテゴリ名を使用する", () => {
      const row: QuizQuestionRow = {
        id: "q2",
        question: "テスト問題",
        option1: "A",
        option2: "B",
        option3: "C",
        option4: "D",
        correct_answer: 1,
        explanation: "説明",
        quiz_categories: [{ name: "カテゴリ1" }, { name: "カテゴリ2" }],
      };

      const result = transformQuizRow(row);

      expect(result.category).toBe("カテゴリ1");
    });

    it("quiz_categoriesがnullの場合、'その他'を返す", () => {
      const row: QuizQuestionRow = {
        id: "q3",
        question: "テスト問題",
        option1: "A",
        option2: "B",
        option3: "C",
        option4: "D",
        correct_answer: 1,
        explanation: "説明",
        quiz_categories: null,
      };

      const result = transformQuizRow(row);

      expect(result.category).toBe("その他");
    });

    it("explanationがnullの場合、nullをそのまま返す", () => {
      const row: QuizQuestionRow = {
        id: "q4",
        question: "テスト問題",
        option1: "A",
        option2: "B",
        option3: "C",
        option4: "D",
        correct_answer: 1,
        explanation: null,
        quiz_categories: { name: "テスト" },
      };

      const result = transformQuizRow(row);

      expect(result.explanation).toBeNull();
    });
  });

  describe("gradeQuizAnswers", () => {
    const questions: QuizQuestion[] = [
      {
        id: "q1",
        question: "問題1",
        options: ["A", "B", "C", "D"],
        correct_answer: 1,
        explanation: "解説1",
      },
      {
        id: "q2",
        question: "問題2",
        options: ["A", "B", "C", "D"],
        correct_answer: 2,
        explanation: "解説2",
      },
      {
        id: "q3",
        question: "問題3",
        options: ["A", "B", "C", "D"],
        correct_answer: 3,
        explanation: "解説3",
      },
      {
        id: "q4",
        question: "問題4",
        options: ["A", "B", "C", "D"],
        correct_answer: 4,
        explanation: "解説4",
      },
      {
        id: "q5",
        question: "問題5",
        options: ["A", "B", "C", "D"],
        correct_answer: 1,
        explanation: null,
      },
    ];

    it("全問正解の場合、スコア100で合格", () => {
      const answers: QuizAnswer[] = [
        { questionId: "q1", selectedAnswer: 1 },
        { questionId: "q2", selectedAnswer: 2 },
        { questionId: "q3", selectedAnswer: 3 },
        { questionId: "q4", selectedAnswer: 4 },
        { questionId: "q5", selectedAnswer: 1 },
      ];

      const result = gradeQuizAnswers(questions, answers);

      expect(result.score).toBe(100);
      expect(result.passed).toBe(true);
      expect(result.correctAnswers).toBe(5);
      expect(result.totalQuestions).toBe(5);
      expect(result.results.every((r) => r.correct)).toBe(true);
    });

    it("全問不正解の場合、スコア0で不合格", () => {
      const answers: QuizAnswer[] = [
        { questionId: "q1", selectedAnswer: 2 },
        { questionId: "q2", selectedAnswer: 1 },
        { questionId: "q3", selectedAnswer: 1 },
        { questionId: "q4", selectedAnswer: 1 },
        { questionId: "q5", selectedAnswer: 2 },
      ];

      const result = gradeQuizAnswers(questions, answers);

      expect(result.score).toBe(0);
      expect(result.passed).toBe(false);
      expect(result.correctAnswers).toBe(0);
      expect(result.results.every((r) => !r.correct)).toBe(true);
    });

    it("部分正解の場合（80%正解でも全問正解でなければ不合格）", () => {
      const answers: QuizAnswer[] = [
        { questionId: "q1", selectedAnswer: 1 },
        { questionId: "q2", selectedAnswer: 2 },
        { questionId: "q3", selectedAnswer: 3 },
        { questionId: "q4", selectedAnswer: 4 },
        { questionId: "q5", selectedAnswer: 2 }, // 不正解
      ];

      const result = gradeQuizAnswers(questions, answers);

      expect(result.score).toBe(80);
      expect(result.passed).toBe(false);
      expect(result.correctAnswers).toBe(4);
      expect(result.totalQuestions).toBe(5);
    });

    it("空の回答配列の場合、スコア0で不合格", () => {
      const answers: QuizAnswer[] = [];

      const result = gradeQuizAnswers(questions, answers);

      expect(result.score).toBe(0);
      expect(result.passed).toBe(false);
      expect(result.correctAnswers).toBe(0);
      expect(result.totalQuestions).toBe(5);
      expect(result.results).toHaveLength(0);
    });

    it("存在しないquestionIdの回答は不正解として扱う", () => {
      const answers: QuizAnswer[] = [
        { questionId: "nonexistent", selectedAnswer: 1 },
      ];

      const result = gradeQuizAnswers(questions, answers);

      expect(result.results[0].correct).toBe(false);
      expect(result.results[0].explanation).toBe("");
      expect(result.results[0].correctAnswer).toBe(0);
    });

    it("explanationがnullの問題は空文字列で返す", () => {
      const answers: QuizAnswer[] = [{ questionId: "q5", selectedAnswer: 1 }];

      const result = gradeQuizAnswers(questions, answers);

      expect(result.results[0].correct).toBe(true);
      expect(result.results[0].explanation).toBe("");
    });
  });
});
