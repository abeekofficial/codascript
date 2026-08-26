import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { ProblemService } from './services/problem.service';
import { SandboxService } from './services/sandbox.service';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/codascript';

async function testMainFlow() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to DB');

  const problemService = new ProblemService();
  await mongoose.model('Problem').deleteMany({ slug: 'test-add-two-numbers' });

  // 1. Create a problem
  const problem = await problemService.createProblem({
    title: 'Test Problem - Add Two Numbers',
    slug: 'test-add-two-numbers',
    difficulty: 'easy',
    topic: 'javascript',
    description: 'Add two numbers from INPUT',
    starterCode: { javascript: `const [a, b] = INPUT.split(' ').map(Number);\nconsole.log(a + b);` } as any,
    testCases: [
      { input: '2 3', expectedOutput: '5', isHidden: false },
      { input: '-1 5', expectedOutput: '4', isHidden: false },
      { input: '10 20', expectedOutput: '30', isHidden: true }, // hidden case
    ]
  });

  console.log('Created problem with ID:', problem._id);

  // 2. Open problem on frontend (Simulation: Fetch client problems)
  const clientProblem = await problemService.getClientProblemBySlug('test-add-two-numbers');
  console.log('Fetched problem for client:', clientProblem?.title, 'Test cases:', clientProblem?.testCases);

  // 3. User edits code and clicks Run (runs against public test cases)
  const userCode = `const [a, b] = INPUT.split(' ').map(Number);\nconsole.log(a + b);`;
  
  const runResult = await problemService.runCode(clientProblem!.id.toString(), userCode, 'javascript');
  console.log('Run Code Result:', JSON.stringify(runResult, null, 2));

  // 4. User clicks Submit (runs against all test cases)
  const submitResult = await problemService.submitCode(clientProblem!.id.toString(), userCode, 'javascript');
  console.log('Submit Code Result:', JSON.stringify(submitResult, null, 2));

  await mongoose.disconnect();
}

testMainFlow().catch(console.error);
