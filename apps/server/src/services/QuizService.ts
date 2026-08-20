import { QuizAttemptRepository } from '../repositories/QuizAttemptRepository';
import { QuestionRepository } from '../repositories/QuestionRepository';
import crypto from 'crypto';

export class QuizService {
  private attemptRepo = new QuizAttemptRepository();
  private questionRepo = new QuestionRepository();

  async startQuiz(
    userId: string, 
    topic: string, 
    difficulty: string, 
    mode: 'topic' | 'mixed', 
    count: number | 'all'
  ) {
    const rawQuestions = await this.questionRepo.findByTopicAndDifficulty(topic, difficulty, mode, count);
    if (rawQuestions.length === 0) throw { statusCode: 404, message: 'No questions available for this configuration' };

    // Format questions for client (shuffle options and hide correctOptionId)
    const questions = rawQuestions.map(q => {
      const options = [...q.options];
      const correctAnswer = q.options[q.correctOptionId];
      
      // Shuffle options
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }
      
      return {
        id: q._id.toString(),
        topic: q.topic,
        difficulty: q.difficulty,
        question: q.question,
        options,
        explanation: q.explanation
      };
    });

    const quizId = crypto.randomBytes(16).toString('hex');

    const attemptData = {
      userId,
      quizId,
      topic,
      difficulty: difficulty as any,
      totalQuestions: questions.length,
      status: 'started' as const,
      answers: []
    };

    await this.attemptRepo.create(attemptData);

    return {
      quizId,
      questions
    };
  }

  async submitAnswer(quizId: string, userId: string, questionId: string, selectedOptionIndex: number, selectedOptionText: string) {
    const attempt = await this.attemptRepo.findByQuizId(quizId);
    if (!attempt) throw { statusCode: 404, message: 'Quiz attempt not found' };
    if (attempt.userId !== userId) throw { statusCode: 403, message: 'Forbidden' };
    if (attempt.status !== 'started') throw { statusCode: 400, message: 'Quiz is not active' };

    const alreadyAnswered = attempt.answers.find(a => a.questionId === questionId);
    if (alreadyAnswered) throw { statusCode: 400, message: 'Question already answered' };

    const question = await this.questionRepo.findById(questionId);
    if (!question) throw { statusCode: 404, message: 'Question not found' };

    // Check if correct
    const correctAnswerText = question.options[question.correctOptionId];
    const isCorrect = correctAnswerText === selectedOptionText;

    attempt.answers.push({
      questionId,
      selectedOptionId: selectedOptionIndex,
      isCorrect,
      answeredAt: new Date()
    });

    attempt.answeredQuestions += 1;
    if (isCorrect) attempt.correctAnswers += 1;
    else attempt.wrongAnswers += 1;

    await this.attemptRepo.updateByQuizId(quizId, attempt);

    return {
      isCorrect,
      explanation: question.explanation
    };
  }

  async completeQuiz(quizId: string, userId: string) {
    const attempt = await this.attemptRepo.findByQuizId(quizId);
    if (!attempt) throw { statusCode: 404, message: 'Quiz attempt not found' };
    if (attempt.userId !== userId) throw { statusCode: 403, message: 'Forbidden' };
    if (attempt.status === 'completed') return attempt;

    attempt.status = 'completed';
    attempt.completedAt = new Date();
    attempt.score = (attempt.correctAnswers / attempt.totalQuestions) * 100;

    await this.attemptRepo.updateByQuizId(quizId, attempt);
    return attempt;
  }
}
