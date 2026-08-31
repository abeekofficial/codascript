'use client';

import { Button } from '@/components/ui/button';
import { api } from '@/services/api';
import { ClientQuestion, useQuizStore } from '@/store/quizStore';
import Editor from '@monaco-editor/react';
import {
  CheckCircleIcon,
  PlayIcon,
  RotateCcwIcon,
  SendIcon,
  TerminalIcon,
  XCircleIcon,
  BookmarkIcon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface CodeQuestionProps {
  question: ClientQuestion;
  onAnswerSubmit: (isCorrect: boolean, code: string) => void;
  disabled?: boolean;
}

export function CodeQuestion({
  question,
  onAnswerSubmit,
  disabled,
}: CodeQuestionProps) {
  const quizId = useQuizStore(state => state.quizId);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [testResults, setTestResults] = useState<
    | { pass: boolean; expected: string; actual: string; isHidden?: boolean }[]
    | null
  >(null);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'console' | 'results'>('results');
  const [showConsole, setShowConsole] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    api.checkSaved('question', question.id).then(setIsSaved).catch(console.error);
  }, [question.id]);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize code from localStorage or starter code
  useEffect(() => {
    const savedCode = localStorage.getItem(`code_${question.id}`);
    if (savedCode) {
      setCode(savedCode);
    } else {
      setCode(question.starterCode || '');
    }
    setOutput('');
    setTestResults(null);
    setConsoleLogs([]);
    setShowConsole(false);
  }, [question.id, question.starterCode]);

  // Save code to localStorage on change
  useEffect(() => {
    if (code !== '') {
      localStorage.setItem(`code_${question.id}`, code);
    }
  }, [code, question.id]);

  // Handle iframe messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Note: without allow-same-origin, origin might be "null". We can verify by checking if iframe exists.
      if (
        event.data &&
        typeof event.data === 'object' &&
        event.data.source === 'code-sandbox'
      ) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        if (event.data.type === 'TEST_RESULTS') {
          setTestResults(event.data.results);
          setIsEvaluating(false);
          setActiveTab('results');

          if (event.data.isSubmit) {
            const allPassed = event.data.results.every((r: any) => r.pass);
            onAnswerSubmit(allPassed, code);
          }
        } else if (event.data.type === 'ERROR') {
          setOutput(`Sintaksis yoki mantiqiy xato:\n${event.data.error}`);
          setIsEvaluating(false);
          setActiveTab('console');
        } else if (event.data.type === 'CONSOLE') {
          setConsoleLogs(prev => [...prev, event.data.text]);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [code, onAnswerSubmit]);

  const runSandbox = (testCases: any[], isSubmit: boolean) => {
    setIsEvaluating(true);
    setOutput('');
    setTestResults(null);
    setConsoleLogs([]);
    setShowConsole(true);
    setActiveTab('console');

    // Timeout protection for infinite loops
    timeoutRef.current = setTimeout(() => {
      setOutput('Vaqt tugadi: Cheksiz sikl yoki juda sekin kod.');
      setIsEvaluating(false);
      setActiveTab('console');
      if (iframeRef.current) iframeRef.current.srcdoc = '';
      if (isSubmit) onAnswerSubmit(false, code);
    }, 3000);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head></head>
      <body>
        <script>
          const postMsg = (data) => window.parent.postMessage({ source: 'code-sandbox', ...data }, '*');

          // Intercept console.log
          const oldLog = console.log;
          console.log = function(...args) {
            postMsg({ type: 'CONSOLE', text: args.join(' ') });
            oldLog.apply(console, args);
          };

          window.onerror = function(msg, url, lineNo, columnNo, error) {
            postMsg({ type: 'ERROR', error: msg });
            return false;
          };

          try {
            // User code
            ${code}

            // Test execution
            const testCases = ${JSON.stringify(testCases)};
            const results = [];

            for (let i = 0; i < testCases.length; i++) {
              const tc = testCases[i];
              let actual;
              try {
                // If tc.input is a function call like "sum(2,3)"
                actual = eval(tc.input);

                // Simple string comparison for now
                const pass = JSON.stringify(actual) === tc.expectedOutput || String(actual) === String(tc.expectedOutput);
                results.push({ pass, expected: tc.expectedOutput, actual: JSON.stringify(actual), isHidden: tc.isHidden });
              } catch (e) {
                results.push({ pass: false, expected: tc.expectedOutput, actual: e.message, isHidden: tc.isHidden });
              }
            }

            postMsg({ type: 'TEST_RESULTS', results, isSubmit: ${isSubmit} });

          } catch (error) {
            postMsg({ type: 'ERROR', error: error.message });
          }
        </script>
      </body>
      </html>
    `;

    if (iframeRef.current) {
      iframeRef.current.srcdoc = htmlContent;
    }
  };

  const handleRun = () => {
    const openTests = (question.testCases || []).filter(tc => !tc.isHidden);
    runSandbox(openTests, false);
  };

  const handleSubmit = async () => {
    if (!quizId) return;
    try {
      setIsEvaluating(true);
      // Fetch ALL test cases from backend
      const fullTestCases = await api.getTestCases(quizId, question.id);
      runSandbox(fullTestCases, true);
    } catch (err: any) {
      alert('Xatolik: ' + err.message);
      setIsEvaluating(false);
    }
  };

  const handleReset = () => {
    if (
      confirm(
        "Kodni boshlang'ich holatiga qaytarishni xohlaysizmi? Yozgan kodingiz o'chib ketadi."
      )
    ) {
      setCode(question.starterCode || '');
      localStorage.removeItem(`code_${question.id}`);
      setOutput('');
      setTestResults(null);
      setConsoleLogs([]);
      setShowConsole(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[600px] w-full">
      {/* LEFT PANEL: Question & Examples */}
      <div className="flex-1 border border-line rounded-xl bg-surface p-6 overflow-y-auto coda-scroll">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">{question.question}</h3>
          <button
            onClick={async () => {
              try {
                if (isSaved) {
                  await api.unsaveItem('question', question.id);
                  setIsSaved(false);
                } else {
                  await api.saveItem('question', question.id);
                  setIsSaved(true);
                }
              } catch (e) {
                console.error(e);
              }
            }}
            className="p-2 hover:bg-elevated rounded-xl transition-colors"
          >
            <BookmarkIcon className={`h-5 w-5 ${isSaved ? 'fill-neon text-neon' : 'text-ink-dim'}`} />
          </button>
        </div>

        {question.testCases && question.testCases.length > 0 && (
          <div className="mt-6 space-y-4">
            <h4 className="font-semibold text-ink-dim">Misollar:</h4>
            {question.testCases.map((tc, idx) => (
              <div
                key={idx}
                className="bg-elevated p-4 rounded-lg border border-line"
              >
                <p className="font-mono text-sm mb-2">
                  <span className="text-neon font-bold">Input:</span> {tc.input}
                </p>
                <p className="font-mono text-sm">
                  <span className="text-success font-bold">Output:</span>{' '}
                  {tc.expectedOutput}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT PANEL: Editor & Console */}
      <div className="flex-[1.5] flex flex-col border border-line rounded-xl bg-[#1E1E1E] overflow-hidden">
        {/* Editor Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-[#333] bg-[#252526]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-400 uppercase">
              {question.language || 'javascript'}
            </span>
          </div>
          <button
            onClick={handleReset}
            disabled={disabled || isEvaluating}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <RotateCcwIcon className="h-3 w-3" />
            Boshlang'ich kodga qaytarish
          </button>
        </div>

        {/* Monaco Editor */}
        <div className="flex-1 relative min-h-[300px]">
          <Editor
            height="100%"
            defaultLanguage={question.language || 'javascript'}
            theme="vs-dark"
            value={code}
            onChange={val => setCode(val || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              readOnly: disabled,
              scrollBeyondLastLine: false,
            }}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 p-3 border-t border-[#333] bg-[#252526]">
          <Button
            onClick={handleRun}
            disabled={disabled || isEvaluating}
            variant="outline"
            className="border-[#444] text-white hover:bg-[#333] h-9"
          >
            <PlayIcon className="h-4 w-4 mr-2 text-warning" />
            {isEvaluating && !showConsole ? '...' : 'Ishga tushirish'}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={disabled || isEvaluating}
            className="bg-neon text-[#0B0F14] hover:bg-neon-hover font-bold h-9"
          >
            <SendIcon className="h-4 w-4 mr-2" />
            {isEvaluating && showConsole ? 'Tekshirilmoqda...' : 'Yuborish'}
          </Button>
        </div>

        {/* Console / Results Panel */}
        {showConsole && (
          <div className="h-[200px] flex flex-col border-t border-[#333] bg-[#1E1E1E]">
            <div className="flex border-b border-[#333]">
              <button
                onClick={() => setActiveTab('results')}
                className={`px-4 py-2 text-xs font-semibold uppercase ${activeTab === 'results' ? 'text-white border-b-2 border-neon' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Test Natijalari
              </button>
              <button
                onClick={() => setActiveTab('console')}
                className={`px-4 py-2 text-xs font-semibold uppercase flex items-center gap-2 ${activeTab === 'console' ? 'text-white border-b-2 border-neon' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <TerminalIcon className="h-3 w-3" /> Konsol
              </button>
              <button
                onClick={() => setShowConsole(false)}
                className="ml-auto px-4 py-2 text-gray-500 hover:text-white"
              >
                <XCircleIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto coda-scroll p-4 font-mono text-sm">
              {activeTab === 'console' && (
                <div className="space-y-1">
                  {consoleLogs.map((log, i) => (
                    <div key={i} className="text-gray-300">
                      {log}
                    </div>
                  ))}
                  {output && (
                    <div className="text-danger mt-2 whitespace-pre-wrap">
                      {output}
                    </div>
                  )}
                  {!consoleLogs.length && !output && (
                    <div className="text-gray-500 italic">
                      Konsolda hech narsa yo'q...
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'results' && testResults && (
                <div className="space-y-3">
                  {testResults.map((res, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 bg-[#252526] p-3 rounded border border-[#333]"
                    >
                      {res.pass ? (
                        <CheckCircleIcon className="h-5 w-5 text-success shrink-0 mt-0.5" />
                      ) : (
                        <XCircleIcon className="h-5 w-5 text-danger shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span
                          className={`font-bold ${res.pass ? 'text-success' : 'text-danger'}`}
                        >
                          Test {idx + 1} {res.isHidden ? '(Yashirin)' : ''}
                        </span>
                        {!res.pass && !res.isHidden && (
                          <div className="text-xs text-gray-400 mt-2 space-y-1">
                            <p>
                              <span className="text-gray-500">Kutilgan:</span>{' '}
                              {res.expected}
                            </p>
                            <p>
                              <span className="text-gray-500">Qaytgan:</span>{' '}
                              {res.actual}
                            </p>
                          </div>
                        )}
                        {!res.pass && res.isHidden && (
                          <div className="text-xs text-gray-400 mt-1">
                            Yashirin test case dan o'tolmadi.
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'results' && !testResults && isEvaluating && (
                <div className="text-gray-500 animate-pulse">
                  Tekshirilmoqda...
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Hidden iframe for sandbox execution without allow-same-origin */}
      <iframe
        ref={iframeRef}
        sandbox="allow-scripts"
        className="hidden"
        title="Code Execution Sandbox"
      />
    </div>
  );
}
