import React from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string | undefined) => void;
  height?: string;
  readOnly?: boolean;
}

export function CodeEditor({ language, value, onChange, height = '100%', readOnly = false }: CodeEditorProps) {
  const monaco = useMonaco();

  // You can customize the Monaco editor theme here if needed
  React.useEffect(() => {
    if (monaco) {
      monaco.editor.defineTheme('codascript-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': '#0D1117', // Match the surface color of the app
        }
      });
      monaco.editor.setTheme('codascript-dark');
    }
  }, [monaco]);

  return (
    <div className="h-full flex-1 overflow-hidden rounded-xl border border-line">
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={onChange}
        theme="codascript-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineHeight: 24,
          padding: { top: 16, bottom: 16 },
          scrollBeyondLastLine: false,
          readOnly,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          wordWrap: 'on',
        }}
        loading={
          <div className="flex h-full items-center justify-center bg-surface text-sm text-ink-dim">
            Muharrir yuklanmoqda...
          </div>
        }
      />
    </div>
  );
}
