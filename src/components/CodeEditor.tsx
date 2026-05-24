import React from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  code: string;
  onChange?: (value: string | undefined) => void;
  language?: string;
  readOnly?: boolean;
  title: string;
  framework?: string | null;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  language = 'javascript',
  readOnly = false,
  title,
  framework
}) => {
  return (
    <div className="flex flex-col h-full border border-border rounded-lg overflow-hidden bg-surface">
      <div className="flex items-center justify-between px-4 py-2 bg-background/50 border-b border-border">
        <span className="text-sm font-medium text-muted">{title}</span>
        {framework && (
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-accent/20 text-accent border border-accent/30">
            {framework}
          </span>
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={onChange}
          theme="vs-dark"
          options={{
            readOnly,
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 16, bottom: 16 },
            wordWrap: 'on'
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
