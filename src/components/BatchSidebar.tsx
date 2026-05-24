import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { selectBatchJob, MigrationStatus } from '../features/migration/migrationSlice';
import { FileCode, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

const BatchSidebar: React.FC = () => {
  const dispatch = useDispatch();
  const { batchJobs, currentJob } = useSelector((state: RootState) => state.migration);

  const getStatusIcon = (status: MigrationStatus) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-error" />;
      case 'pending': return <Clock className="w-4 h-4 text-accent animate-pulse" />;
      case 'reviewed': return <AlertCircle className="w-4 h-4 text-warning" />;
      default: return <FileCode className="w-4 h-4 text-muted" />;
    }
  };

  if (batchJobs.length === 0) return null;

  return (
    <div className="w-64 bg-surface border-r border-border flex flex-col h-full">
      <div className="p-4 border-b border-border bg-background/30">
        <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Batch Progress</h3>
        <div className="mt-2 text-[10px] text-muted font-medium">
          {batchJobs.filter(j => j.status === 'approved').length} / {batchJobs.length} COMPLETED
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {batchJobs.map((job) => (
          <button
            key={job.id}
            onClick={() => dispatch(selectBatchJob(job.id))}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left ${
              currentJob.id === job.id 
                ? 'bg-accent/10 text-accent font-medium shadow-sm border border-accent/20' 
                : 'text-muted hover:bg-background hover:text-primary'
            }`}
          >
            {getStatusIcon(job.status)}
            <span className="text-xs truncate">{job.fileName}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BatchSidebar;
