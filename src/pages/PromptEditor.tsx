import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { updateTemplate, selectPrompt } from '../features/prompts/promptSlice';
import { Save, Terminal, History, Info } from 'lucide-react';

const PromptEditor: React.FC = () => {
  const dispatch = useDispatch();
  const { templates, selectedPromptId } = useSelector((state: RootState) => state.prompts);
  const selectedPrompt = templates.find(t => t.id === selectedPromptId) || templates[0];
  const [localTemplate, setLocalTemplate] = React.useState(selectedPrompt.template);

  React.useEffect(() => {
    setLocalTemplate(selectedPrompt.template);
  }, [selectedPrompt]);

  const handleSave = () => {
    dispatch(updateTemplate({ id: selectedPrompt.id, template: localTemplate }));
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-primary">TestMigrate AI</h1>
          <div className="h-6 w-[1px] bg-border mx-2" />
          <h2 className="text-sm font-medium text-muted uppercase tracking-wider flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            Prompt Editor
          </h2>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/80 text-white rounded font-medium transition-all"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r border-border bg-surface/30">
          <div className="p-4 border-b border-border">
            <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Prompt Templates</span>
          </div>
          <div className="p-2 space-y-1">
            {templates.map(p => (
              <button
                key={p.id}
                onClick={() => dispatch(selectPrompt(p.id))}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                  selectedPrompt.id === p.id 
                    ? 'bg-accent/10 text-accent font-medium border border-accent/20' 
                    : 'text-muted hover:bg-background hover:text-primary'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col p-6 space-y-6 overflow-y-auto">
          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{selectedPrompt.name} Template</h3>
              <div className="flex items-center gap-2 text-xs text-muted">
                <History className="w-3 h-3" />
                Version {selectedPrompt.version}
              </div>
            </div>
            
            <textarea
              className="w-full h-[400px] bg-background border border-border rounded-lg p-4 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-accent resize-none leading-relaxed"
              value={localTemplate}
              onChange={(e) => setLocalTemplate(e.target.value)}
            />
            
            <div className="mt-4 flex items-start gap-3 p-4 bg-accent/5 rounded-lg border border-accent/10">
              <Info className="w-5 h-5 text-accent shrink-0" />
              <p className="text-xs text-muted leading-relaxed">
                Use placeholders like <code className="text-accent">{"${sourceCode}"}</code> and <code className="text-accent">{"${sourceFramework}"}</code> to dynamically inject content into the prompt at runtime. Changes will take effect immediately for all subsequent migrations.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PromptEditor;
