import ivm from 'isolated-vm';

export interface CodeExecutionResult {
  output: string;
  error?: string;
  executionTimeMs: number;
}

export class SandboxService {
  /**
   * Executes JavaScript code securely in an isolated environment.
   */
  public static async executeJavascript(
    code: string,
    testInput: string,
    timeoutMs = 2000,
    memoryLimitMb = 128
  ): Promise<CodeExecutionResult> {
    const isolate = new ivm.Isolate({ memoryLimit: memoryLimitMb });
    const startTime = Date.now();

    try {
      const context = await isolate.createContext();
      const jail = context.global;
      await jail.set('global', jail.derefInto());
      
      // Allow reading inputs
      await jail.set('INPUT', testInput);

      // We'll capture console.log output as actualOutput
      const logs: string[] = [];
      await jail.set('log', new ivm.Callback((...args: any[]) => {
        logs.push(args.join(' '));
      }));

      await context.evalClosure(`
        global.console = {
          log: function(...args) {
            var strings = args.map(function(a) {
              try {
                if (typeof a === 'object' && a !== null) return JSON.stringify(a);
                return String(a);
              } catch(e) {
                return String(a);
              }
            });
            log.apply(null, strings);
          },
          error: function(...args) {
            var strings = args.map(function(a) {
              try {
                if (typeof a === 'object' && a !== null) return JSON.stringify(a);
                return String(a);
              } catch(e) {
                return String(a);
              }
            });
            log.apply(null, strings);
          }
        };
      `);

      // Run user code
      // We wrap the user code in a function or just execute it directly.
      const script = await isolate.compileScript(code);
      
      await script.run(context, { timeout: timeoutMs });

      return {
        output: logs.join('\n').trim(),
        executionTimeMs: Date.now() - startTime,
      };

    } catch (error: any) {
      return {
        output: '',
        error: error.message || String(error),
        executionTimeMs: Date.now() - startTime,
      };
    } finally {
      isolate.dispose();
    }
  }
}
