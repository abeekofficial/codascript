import { SandboxService } from './services/sandbox.service';

async function test() {
  const code = `
    throw new Error('Some error');
  `;
  const result = await SandboxService.executeJavascript(code, '2, 3');
  console.log('Sandbox Output:', result);
}

test().catch(console.error);
