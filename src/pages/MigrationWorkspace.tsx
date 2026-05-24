import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { 
  setSourceCode, 
  setSourceFramework, 
  setMigrationResult, 
  setMigrationError,
  setStatus,
  updateGeneratedCode,
  addBatchJobs,
  updateBatchJobStatus
} from '../features/migration/migrationSlice';
import { useMigrateMutation } from '../services/api';
import CodeEditor from '../components/CodeEditor';
import BatchSidebar from '../components/BatchSidebar';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Download, 
  Copy,
  AlertCircle,
  Loader2,
  Layers
} from 'lucide-react';

const MigrationWorkspace: React.FC = () => {
  const dispatch = useDispatch();
  const { currentJob, isBatchMode } = useSelector((state: RootState) => state.migration);
  const [migrate, { isLoading }] = useMigrateMutation();

  const handleSourceChange = (value: string | undefined) => {
    dispatch(setSourceCode(value || ''));
  };

  const handleGeneratedChange = (value: string | undefined) => {
    dispatch(updateGeneratedCode(value || ''));
  };

  const handleBatchUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const filePromises = Array.from(files).map(file => {
      return new Promise<{ fileName: string, sourceCode: string, sourceFramework: 'testcafe' | 'cypress' }>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve({
            fileName: file.name,
            sourceCode: event.target?.result as string,
            sourceFramework: file.name.includes('cypress') || file.name.includes('spec') ? 'cypress' : 'testcafe'
          });
        };
        reader.readAsText(file);
      });
    });

    Promise.all(filePromises).then(results => {
      dispatch(addBatchJobs(results));
    });
  };

  const handleMigrate = async () => {
    if (!currentJob.sourceCode || !currentJob.sourceFramework) return;

    dispatch(setStatus('pending'));
    if (isBatchMode && currentJob.id) {
      dispatch(updateBatchJobStatus({ id: currentJob.id, status: 'pending' }));
    }

    try {
      const result = await migrate({
        sourceCode: currentJob.sourceCode,
        sourceFramework: currentJob.sourceFramework,
        targetFramework: 'playwright'
      }).unwrap();

      dispatch(setMigrationResult(result));
    } catch (err: any) {
      dispatch(setMigrationError(err.data?.error || 'Migration failed'));
    }
  };

  const handleApprove = () => {
    dispatch(setStatus('approved'));
    if (isBatchMode && currentJob.id) {
      dispatch(updateBatchJobStatus({ id: currentJob.id, status: 'approved' }));
    }
  };

  const handleReject = () => {
    dispatch(setStatus('rejected'));
    if (isBatchMode && currentJob.id) {
      dispatch(updateBatchJobStatus({ id: currentJob.id, status: 'rejected' }));
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentJob.generatedCode);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([currentJob.generatedCode], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = currentJob.fileName.replace('.js', '.spec.ts').replace('.ts', '.spec.ts');
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex h-full bg-background overflow-hidden">
      {isBatchMode && <BatchSidebar />}
      
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-muted uppercase tracking-wider">Source:</label>
              <select 
                className="bg-background border border-border rounded px-2 py-1 text-sm text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                value={currentJob.sourceFramework || ''}
                onChange={(e) => dispatch(setSourceFramework(e.target.value as any))}
              >
                <option value="" disabled>Select Framework</option>
                <option value="cypress">Cypress</option>
                <option value="testcafe">TestCafe</option>
              </select>
            </div>
            <div className="h-6 w-[1px] bg-border mx-2" />
            <label className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-border rounded text-sm text-muted hover:text-primary cursor-pointer transition-colors">
              <Layers className="w-4 h-4" />
              Batch Upload
              <input type="file" multiple className="hidden" onChange={handleBatchUpload} />
            </label>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleMigrate}
              disabled={isLoading || !currentJob.sourceCode || !currentJob.sourceFramework}
              className={`flex items-center gap-2 px-4 py-2 rounded font-medium transition-all ${
                isLoading || !currentJob.sourceCode || !currentJob.sourceFramework
                  ? 'bg-muted/20 text-muted cursor-not-allowed'
                  : 'bg-accent hover:bg-accent/80 text-white shadow-lg shadow-accent/20'
              }`}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {isLoading ? 'Migrating...' : 'Migrate to Playwright'}
            </button>
          </div>
        </header>

        <main className="flex-1 flex gap-4 p-4 min-h-0">
          <div className="flex-1 min-w-0">
            <CodeEditor 
              title={isBatchMode ? `Source: ${currentJob.fileName}` : "Source Code"}
              code={currentJob.sourceCode}
              onChange={handleSourceChange}
              framework={currentJob.sourceFramework}
              language="javascript"
            />
          </div>
          <div className="flex-1 min-w-0">
            <CodeEditor 
              title="Generated Playwright Code"
              code={currentJob.generatedCode}
              onChange={handleGeneratedChange}
              framework="playwright"
              language="typescript"
              readOnly={currentJob.status === 'idle'}
            />
          </div>
        </main>

        <footer className="flex items-center justify-between px-6 py-3 border-t border-border bg-surface/30">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted uppercase tracking-wider">Status:</span>
              <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded border ${
                currentJob.status === 'approved' ? 'bg-success/10 text-success border-success/30' :
                currentJob.status === 'rejected' ? 'bg-error/10 text-error border-error/30' :
                currentJob.status === 'pending' ? 'bg-accent/10 text-accent border-accent/30 animate-pulse' :
                'bg-muted/10 text-muted border-border'
              }`}>
                {currentJob.status}
              </span>
            </div>
            {currentJob.confidence > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted uppercase tracking-wider">Confidence:</span>
                <span className="text-xs font-mono text-primary">{(currentJob.confidence * 100).toFixed(0)}%</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {(currentJob.status === 'reviewed' || currentJob.status === 'needs-edit' || currentJob.status === 'approved' || currentJob.status === 'rejected') && (
              <>
                <button onClick={handleCopy} className="p-2 hover:bg-surface rounded text-muted hover:text-primary transition-colors" title="Copy to Clipboard">
                  <Copy className="w-4 h-4" />
                </button>
                <button onClick={handleDownload} className="p-2 hover:bg-surface rounded text-muted hover:text-primary transition-colors" title="Download .ts File">
                  <Download className="w-4 h-4" />
                </button>
                <div className="w-[1px] h-4 bg-border mx-1" />
                <button onClick={handleReject} className="flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium text-error hover:bg-error/10 transition-colors">
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
                <button onClick={handleApprove} className="flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium text-success hover:bg-success/10 transition-colors">
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
              </>
            )}
            {currentJob.error && (
              <div className="flex items-center gap-2 text-error text-xs font-medium bg-error/10 px-3 py-1.5 rounded border border-error/20">
                <AlertCircle className="w-4 h-4" />
                {currentJob.error}
              </div>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MigrationWorkspace;
