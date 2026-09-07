import { QuizAttemptRepository } from "../repositories/QuizAttemptRepository";
import { QuestionRepository } from "../repositories/QuestionRepository";
import { QuizAnswer } from "@codascript/types";
import crypto from "crypto";
import { UserModel } from "../models/User";
import { QuizAttemptModel } from "../models/QuizAttempt";

export class QuizService {
  private attemptRepo = new QuizAttemptRepository();
  private questionRepo = new QuestionRepository();

  async startQuiz(
    userId: string,
    topic: string,
    difficulty: string,
    mode: "topic" | "mixed",
    count: number | "all",
    subtopic?: string,
  ) {
    const rawQuestions = await this.questionRepo.findByTopicAndDifficulty(
      topic,
      difficulty,
      mode,
      count,
      subtopic,
    );
    if (rawQuestions.length === 0)
      throw {
        statusCode: 404,
        message: "No questions available for this configuration",
      };

    // Format questions for client (shuffle options and hide correctOptionId)
    const questions = rawQuestions.map((q) => {
      const options = [...q.options];

      // Shuffle options
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }

      return {
        id: q._id.toString(),
        topic: q.topic,
        subtopic: q.subtopic,
        difficulty: q.difficulty,
        question: q.question,
        options,
        explanation: q.explanation,
        type: q.type,
        language: q.language,
        starterCode: q.starterCode,
        author: q.author,
        testCases: q.testCases
          ? q.testCases.map((tc) =>
              tc.isHidden
                ? { isHidden: true, input: "", expectedOutput: "" }
                : tc,
            )
          : undefined,
      };
    });

    const quizId = crypto.randomBytes(16).toString("hex");

    const attemptData = {
      userId,
      quizId,
      topic,
      difficulty: difficulty as any,
      totalQuestions: questions.length,
      status: "started" as const,
      answers: [],
    };

    await this.attemptRepo.create(attemptData);

    return {
      quizId,
      questions,
    };
  }

  async submitAnswer(
    quizId: string,
    userId: string,
    questionId: string,
    selectedOptionIndex: number,
    selectedOptionText: string,
  ) {
    // Tekshirish uchun attempt ni olish (faqat read)
    const attempt = await this.attemptRepo.findByQuizId(quizId);
    if (!attempt) throw { statusCode: 404, message: "Quiz attempt not found" };
    if (attempt.userId !== userId)
      throw { statusCode: 403, message: "Forbidden" };
    if (attempt.status !== "started")
      throw { statusCode: 400, message: "Quiz is not active" };

    const alreadyAnswered = attempt.answers.find(
      (a) => a.questionId === questionId,
    );
    if (alreadyAnswered)
      throw { statusCode: 400, message: "Question already answered" };

    const question = await this.questionRepo.findById(questionId);
    if (!question) throw { statusCode: 404, message: "Question not found" };

    // To'g'ri javobni aniqlash
    let isCorrect = false;
    let correctAnswerText = "";

    if (question.type === "code") {
      if (!question.testCases || question.testCases.length === 0) {
        isCorrect = false;
        correctAnswerText = "No test cases found";
      } else {
        const { SandboxService } = require("./sandbox.service");
        let allPassed = true;
        for (const testCase of question.testCases) {
          const res = await SandboxService.executeJavascript(selectedOptionText || "", testCase.input);
          if (res.error) {
            allPassed = false;
            break;
          }
          const actTrim = res.output.trim();
          const expTrim = testCase.expectedOutput.trim();
          if (actTrim !== expTrim) {
            try {
              const actJson = JSON.parse(actTrim);
              const expJson = JSON.parse(expTrim);
              if (JSON.stringify(actJson) !== JSON.stringify(expJson)) {
                allPassed = false;
                break;
              }
            } catch {
              allPassed = false;
              break;
            }
          }
        }
        isCorrect = allPassed;
        correctAnswerText = "Code Execution Tests Passed";
      }
    } else {
      // Multiple choice
      correctAnswerText = question.options[question.correctOptionId];
      isCorrect = correctAnswerText === selectedOptionText;
    }

    // Atomik yangilash: $push + $inc — race condition'lardan himoya
    const newAnswer: QuizAnswer = {
      questionId,
      selectedOptionId: selectedOptionIndex,
      isCorrect,
      answeredAt: new Date(),
    };

    await this.attemptRepo.pushAnswer(quizId, newAnswer, isCorrect);

    return {
      isCorrect,
      explanation: question.explanation,
      // Matn asosida to'g'ri javobni qaytarish (indeks emas — aralashtirish muammosini hal qiladi)
      correctAnswerText: correctAnswerText,
    };
  }

  async getTestCases(quizId: string, userId: string, questionId: string) {
    const attempt = await this.attemptRepo.findByQuizId(quizId);
    if (!attempt) throw { statusCode: 404, message: "Quiz attempt not found" };
    if (attempt.userId !== userId)
      throw { statusCode: 403, message: "Forbidden" };

    const question = await this.questionRepo.findById(questionId);
    if (!question) throw { statusCode: 404, message: "Question not found" };
    if (question.type !== "code")
      throw { statusCode: 400, message: "Not a code question" };

    return question.testCases || [];
  }

  async completeQuiz(quizId: string, userId: string) {
    const attempt = await this.attemptRepo.findByQuizId(quizId);
    if (!attempt) throw { statusCode: 404, message: "Quiz attempt not found" };
    if (attempt.userId !== userId)
      throw { statusCode: 403, message: "Forbidden" };
    if (attempt.status === "completed") return attempt;

    const score =
      attempt.totalQuestions > 0
        ? (attempt.correctAnswers / attempt.totalQuestions) * 100
        : 0;

    // Atomik yangilash: faqat status, completedAt, score
    const completed = await this.attemptRepo.completeAttempt(quizId, score);

    // Update user stats
    const earnedXP = attempt.correctAnswers * 10;

    
    const user = await UserModel.findById(userId);
    if (user) {
      user.totalXP = (user.totalXP || 0) + earnedXP;

      // Calculate level (1 level per 1000 XP)
      user.level = Math.floor(user.totalXP / 1000) + 1;

      // Update streak
      const now = new Date();
      const lastActive = user.lastActiveDate
        ? new Date(user.lastActiveDate)
        : now;

      // Soat farqi emas, kalendar kun (yarim tundan yarim tunga) bo'yicha solishtiramiz
      const startOfDay = (d: Date) =>
        new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const diffDays = Math.round(
        (startOfDay(now).getTime() - startOfDay(lastActive).getTime()) /
          (24 * 60 * 60 * 1000),
      );

      if (diffDays === 1) {
        user.currentStreak = (user.currentStreak || 0) + 1;
      } else if (diffDays > 1) {
        user.currentStreak = 1;
      } else if (user.currentStreak === 0) {
        user.currentStreak = 1;
      }
      user.lastActiveDate = now;
      user.completedQuizzes = (user.completedQuizzes || 0) + 1;

      await user.save();
    }

    return completed;
  }

  /**
   * Foydalanuvchining profil statistikasini hisoblash
   */
  async getProfileStats(userId: string) {
    

    const stats = await QuizAttemptModel.aggregate([
      { $match: { userId, status: "completed" } },
      {
        $group: {
          _id: null,
          totalQuizzes: { $sum: 1 },
          totalCorrect: { $sum: "$correctAnswers" },
          totalAnswered: { $sum: "$answeredQuestions" },
          totalTime: {
            $sum: {
              $subtract: [
                { $ifNull: ["$completedAt", new Date()] },
                "$startedAt",
              ],
            },
          },
        },
      },
    ]);

    const result = stats[0] || {
      totalQuizzes: 0,
      totalCorrect: 0,
      totalAnswered: 0,
      totalTime: 0,
    };
    const accuracy =
      result.totalAnswered > 0
        ? Math.round((result.totalCorrect / result.totalAnswered) * 100)
        : 0;
    const totalMinutes = Math.round(result.totalTime / (1000 * 60));
    const totalHours = Math.round(totalMinutes / 60);

    return {
      totalQuizzes: result.totalQuizzes,
      accuracy,
      totalTime:
        totalHours > 0 ? `${totalHours} soat` : `${totalMinutes} daqiqa`,
    };
  }

  /**
   * Oylik o'sish grafigi uchun aggregatsiya
   */
  async getGrowthData(userId: string) {
    

    // So'nggi 8 oyni olish
    const eightMonthsAgo = new Date();
    eightMonthsAgo.setMonth(eightMonthsAgo.getMonth() - 8);

    const monthlyData = await QuizAttemptModel.aggregate([
      {
        $match: {
          userId,
          status: "completed",
          completedAt: { $gte: eightMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$completedAt" },
            month: { $month: "$completedAt" },
          },
          xp: { $sum: { $multiply: ["$correctAnswers", 10] } },
          totalCorrect: { $sum: "$correctAnswers" },
          totalAnswered: { $sum: "$answeredQuestions" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const monthNames = [
      "Yan",
      "Fev",
      "Mar",
      "Apr",
      "May",
      "Iyn",
      "Iyl",
      "Avg",
      "Sen",
      "Okt",
      "Noy",
      "Dek",
    ];

    return monthlyData.map((m: any) => ({
      month: monthNames[m._id.month - 1],
      xp: m.xp,
      accuracy:
        m.totalAnswered > 0
          ? Math.round((m.totalCorrect / m.totalAnswered) * 100)
          : 0,
    }));
  }

  /**
   * Mavzular bo'yicha ko'nikma darajasi
   */
  async getSkillStats(userId: string) {
    

    const skills = await QuizAttemptModel.aggregate([
      { $match: { userId, status: "completed" } },
      {
        $group: {
          _id: "$topic",
          totalCorrect: { $sum: "$correctAnswers" },
          totalAnswered: { $sum: "$answeredQuestions" },
          quizCount: { $sum: 1 },
        },
      },
    ]);

    // topic => TechId mapping
    const topicToTech: Record<string, string> = {
      JavaScript: "js",
      TypeScript: "ts",
      React: "react",
      HTML: "html",
      CSS: "css",
    };

    return skills.map((s: any) => ({
      tech: topicToTech[s._id] || s._id.toLowerCase(),
      value:
        s.totalAnswered > 0
          ? Math.round((s.totalCorrect / s.totalAnswered) * 100)
          : 0,
      solved: s.totalAnswered,
    }));
  }

  /**
   * Foydalanuvchining quiz tarixini qaytarish (pagination bilan)
   */
  async getHistory(userId: string, page = 1, limit = 20) {
    return this.attemptRepo.findByUserId(userId, "completed", page, limit);
  }
}
