import { ClientProblem, RunResult, TestCaseResult } from '@codascript/types';
import { IProblem } from '../models/Problem';
import { ProblemRepository } from '../repositories/problem.repository';
import { SandboxService } from './sandbox.service';

export class ProblemService {
  private repository: ProblemRepository;

  constructor() {
    this.repository = new ProblemRepository();
  }

  async getAllClientProblems(): Promise<ClientProblem[]> {
    const problems = await this.repository.findAll({ isActive: true });
    return problems.map(this.mapToClientProblem);
  }

  async getClientProblemBySlug(slug: string): Promise<ClientProblem | null> {
    const problem = await this.repository.findBySlug(slug);
    if (!problem || !problem.isActive) return null;
    return this.mapToClientProblem(problem);
  }

  async getProblemById(id: string): Promise<IProblem | null> {
    return this.repository.findById(id);
  }

  async getProblemBySlug(slug: string): Promise<IProblem | null> {
    return this.repository.findBySlug(slug);
  }

  async createProblem(data: Partial<IProblem>): Promise<IProblem> {
    return this.repository.create(data);
  }

  async bulkCreateProblems(data: Partial<IProblem>[]): Promise<IProblem[]> {
    return this.repository.insertMany(data);
  }

  async updateProblem(
    id: string,
    data: Partial<IProblem>
  ): Promise<IProblem | null> {
    return this.repository.update(id, data);
  }

  async deleteProblem(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }

  async submitCode(
    problemId: string,
    code: string,
    language: string
  ): Promise<RunResult> {
    const problem = await this.repository.findById(problemId);
    if (!problem) {
      throw new Error('Problem not found');
    }

    if (problem.testCases.length === 0) {
      // submitCode uchun
      return {
        success: true,
        data: {
          problemId,
          status: 'no_test_cases',
          passedTests: 0,
          totalTests: 0,
          results: [],
          score: 0,
        },
      };
    }

    if (language !== 'javascript') {
      throw new Error('Only JavaScript is currently supported');
    }

    const results: TestCaseResult[] = [];
    let allPassed = true;
    let hasRuntimeError = false;
    let hasTimeLimitExceeded = false;

    // Test code against all test cases
    for (const testCase of problem.testCases) {
      const res = await SandboxService.executeJavascript(code, testCase.input);

      let actualOutput = res.output;
      let passed = false;

      if (res.error) {
        if (res.error.includes('timeout') || res.executionTimeMs >= 2000) {
          hasTimeLimitExceeded = true;
          actualOutput = 'Time Limit Exceeded';
        } else {
          hasRuntimeError = true;
          actualOutput = res.error;
        }
      } else {
        // Compare output with deep equality fallback for JSON/numbers
        const actTrim = actualOutput.trim();
        const expTrim = testCase.expectedOutput.trim();
        if (actTrim === expTrim) {
          passed = true;
        } else {
          try {
            const actJson = JSON.parse(actTrim);
            const expJson = JSON.parse(expTrim);
            passed = JSON.stringify(actJson) === JSON.stringify(expJson);
          } catch {
            passed = false;
          }
        }
      }

      if (!passed) {
        allPassed = false;
      }

      results.push({
        input: testCase.isHidden ? 'Hidden Test Case' : testCase.input,
        expectedOutput: testCase.isHidden
          ? 'Hidden Test Case'
          : testCase.expectedOutput,
        actualOutput:
          testCase.isHidden && !res.error && passed
            ? 'Hidden Test Case'
            : actualOutput,
        passed,
        executionTimeMs: res.executionTimeMs,
      });

      // Stop on first failure to simulate standard CP platforms, or just run all. Let's run all to give full feedback.
    }

    const passedCount = results.filter(r => r.passed).length;
    const score =
      problem.testCases.length > 0
        ? Math.round((passedCount / problem.testCases.length) * 100)
        : 0;

    let status: RunResult['data']['status'] = 'wrong_answer';
    if (hasRuntimeError) status = 'runtime_error';
    else if (hasTimeLimitExceeded) status = 'time_limit_exceeded';
    else if (allPassed) status = 'accepted';

    return {
      success: true,
      data: {
        problemId,
        status,
        passedTests: passedCount,
        totalTests: problem.testCases.length,
        results,
        score,
      },
    };
  }

  async runCode(
    problemId: string,
    code: string,
    language: string
  ): Promise<RunResult> {
    const problem = await this.repository.findById(problemId);
    if (!problem) {
      throw new Error('Problem not found');
    }

    const publicTestCases = problem.testCases.filter(tc => !tc.isHidden);

    if (publicTestCases.length === 0) {
      // runCode uchun faqat public testCaselar tekshiriladi
      return {
        success: true,
        data: {
          problemId,
          status: 'no_test_cases',
          passedTests: 0,
          totalTests: 0,
          results: [],
          score: 0,
        },
      };
    }

    if (language !== 'javascript') {
      throw new Error('Only JavaScript is currently supported');
    }

    const results: TestCaseResult[] = [];
    let allPassed = true;
    let hasRuntimeError = false;
    let hasTimeLimitExceeded = false;

    // Test code against PUBLIC test cases only
    for (const testCase of publicTestCases) {
      const res = await SandboxService.executeJavascript(code, testCase.input);

      let actualOutput = res.output;
      let passed = false;

      if (res.error) {
        if (res.error.includes('timeout') || res.executionTimeMs >= 2000) {
          hasTimeLimitExceeded = true;
          actualOutput = 'Time Limit Exceeded';
        } else {
          hasRuntimeError = true;
          actualOutput = res.error;
        }
      } else {
        // Compare output with deep equality fallback for JSON/numbers
        const actTrim = actualOutput.trim();
        const expTrim = testCase.expectedOutput.trim();
        if (actTrim === expTrim) {
          passed = true;
        } else {
          try {
            const actJson = JSON.parse(actTrim);
            const expJson = JSON.parse(expTrim);
            passed = JSON.stringify(actJson) === JSON.stringify(expJson);
          } catch {
            passed = false;
          }
        }
      }

      if (!passed) {
        allPassed = false;
      }

      results.push({
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: actualOutput,
        passed,
        executionTimeMs: res.executionTimeMs,
      });
    }

    const passedCount = results.filter(r => r.passed).length;
    const score =
      publicTestCases.length > 0
        ? Math.round((passedCount / publicTestCases.length) * 100)
        : 0;

    let status: RunResult['data']['status'] = 'wrong_answer';
    if (hasRuntimeError) status = 'runtime_error';
    else if (hasTimeLimitExceeded) status = 'time_limit_exceeded';
    else if (allPassed) status = 'accepted';

    return {
      success: true,
      data: {
        problemId,
        status,
        passedTests: passedCount,
        totalTests: publicTestCases.length,
        results,
        score,
      },
    };
  }

  private mapToClientProblem(problem: IProblem): ClientProblem {
    const p = problem.toJSON() as any;
    // Hide expectedOutput for hidden test cases
    const clientTestCases = p.testCases.map((tc: any) => ({
      input: tc.input,
      expectedOutput: tc.isHidden ? undefined : tc.expectedOutput,
      isHidden: tc.isHidden,
    }));

    return {
      id: p.id || p._id?.toString(),
      slug: p.slug,
      title: p.title,
      difficulty: p.difficulty,
      topic: p.topic,
      description: p.description,
      constraints: p.constraints,
      examples: p.examples,
      starterCode: p.starterCode,
      tags: p.tags,
      isActive: p.isActive,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      testCases: clientTestCases,
    };
  }
}
