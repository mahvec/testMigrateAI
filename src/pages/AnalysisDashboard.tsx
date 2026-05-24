import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { 
  setLogContent, 
  setAnalysisResult, 
  setAnalysisLoading, 
  setAnalysisError 
} from '../features/analysis/analysisSlice';
import { useAnalyseMutation } from '../services/api';
import { 
  BarChart3, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Bug,
  LayoutDashboard,
  Upload,
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const AnalysisDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const { logContent, failures, stats, isLoading, error } = useSelector((state: RootState) => state.analysis);
  const [analyse, { isLoading: isApiLoading }] = useAnalyseMutation();
  const [expandedIndex, setExpandedIndex] = React.useState<number | null>(null);

  const handleAnalyse = async () => {
    if (!logContent) return;

    dispatch(setAnalysisLoading(true));
    try {
      const result = await analyse({
        logContent,
        logFormat: 'text' // Auto-detection could be added later
      }).unwrap();
      dispatch(setAnalysisResult(result));
    } catch (err: any) {
      dispatch(setAnalysisError(err.data?.error || 'Analysis failed'));
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'assertion': return 'text-error bg-error/10 border-error/20';
      case 'timeout': return 'text-warning bg-warning/10 border-warning/20';
      case 'flaky': return 'text-accent bg-accent/10 border-accent/20';
      case 'selector': return 'text-primary bg-primary/10 border-primary/20';
      default: return 'text-muted bg-muted/10 border-border';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-primary">TestMigrate AI</h1>
          <div className="h-6 w-[1px] bg-border mx-2" />
          <h2 className="text-sm font-medium text-muted uppercase tracking-wider flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4" />
            Analysis Dashboard
          </h2>
        </div>
        <button 
          onClick={handleAnalyse}
          disabled={isLoading || isApiLoading || !logContent}
          className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/80 text-white rounded font-medium transition-all disabled:opacity-50"
        >
          {(isLoading || isApiLoading) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Analyse Logs
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Input Section */}
        {!failures.length && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="bg-surface border border-border rounded-xl p-6 shadow-xl">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-accent" />
                Paste CI Log Output
              </h3>
              <textarea 
                className="w-full h-64 bg-background border border-border rounded-lg p-4 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                placeholder="Paste your test logs here (JSON or Plain Text)..."
                value={logContent}
                onChange={(e) => dispatch(setLogContent(e.target.value))}
              />
            </div>
          </div>
        )}

        {failures.length > 0 && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-surface border border-border p-4 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted uppercase">Total Tests</span>
                  <BarChart3 className="w-4 h-4 text-muted" />
                </div>
                <div className="text-2xl font-bold">{stats.total}</div>
              </div>
              <div className="bg-surface border border-border p-4 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted uppercase">Passed</span>
                  <CheckCircle2 className="w-4 h-4 text-success" />
                </div>
                <div className="text-2xl font-bold text-success">{stats.passed}</div>
              </div>
              <div className="bg-surface border border-border p-4 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted uppercase">Failed</span>
                  <AlertTriangle className="w-4 h-4 text-error" />
                </div>
                <div className="text-2xl font-bold text-error">{stats.failed}</div>
              </div>
              <div className="bg-surface border border-border p-4 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted uppercase">Flaky</span>
                  <Bug className="w-4 h-4 text-accent" />
                </div>
                <div className="text-2xl font-bold text-accent">{stats.flaky}</div>
              </div>
            </div>

            {/* Failure List */}
            <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-border bg-background/30">
                <h3 className="font-semibold text-primary">Categorised Failures</h3>
              </div>
              <div className="divide-y divide-border">
                {failures.map((failure, index) => (
                  <div key={index} className="flex flex-col">
                    <div 
                      className="flex items-center justify-between px-6 py-4 hover:bg-background/20 cursor-pointer transition-colors"
                      onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${getCategoryColor(failure.category)}`}>
                          {failure.category}
                        </span>
                        <span className="font-medium text-sm truncate">{failure.testName}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-muted font-mono">{(failure.confidence * 100).toFixed(0)}% match</span>
                        {expandedIndex === index ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
                      </div>
                    </div>
                    {expandedIndex === index && (
                      <div className="px-6 py-4 bg-background/40 border-t border-border/50 animate-in fade-in slide-in-from-top-2">
                        <div className="flex gap-4">
                          <div className="p-2 bg-accent/10 rounded-lg h-fit">
                            <Bug className="w-5 h-5 text-accent" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold mb-1 text-primary">AI Root Cause Summary</h4>
                            <p className="text-sm text-muted leading-relaxed">
                              {failure.summary}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AnalysisDashboard;
