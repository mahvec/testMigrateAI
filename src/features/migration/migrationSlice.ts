import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type MigrationStatus = 'idle' | 'pending' | 'reviewed' | 'approved' | 'rejected' | 'needs-edit';

export interface MigrationJob {
  id: string;
  fileName: string;
  sourceCode: string;
  generatedCode: string;
  sourceFramework: 'testcafe' | 'cypress' | null;
  targetFramework: 'playwright';
  status: MigrationStatus;
  confidence: number;
  tokensUsed: number;
  warnings: string[];
  error: string | null;
}

export interface MigrationState {
  currentJob: MigrationJob;
  batchJobs: MigrationJob[];
  isBatchMode: boolean;
  history: Array<{
    id: string;
    fileName: string;
    status: MigrationStatus;
    timestamp: number;
  }>;
}

const initialJob: MigrationJob = {
  id: null as any,
  fileName: 'untitled.spec.js',
  sourceCode: '',
  generatedCode: '',
  sourceFramework: null,
  targetFramework: 'playwright',
  status: 'idle',
  confidence: 0,
  tokensUsed: 0,
  warnings: [],
  error: null,
};

const initialState: MigrationState = {
  currentJob: initialJob,
  batchJobs: [],
  isBatchMode: false,
  history: [],
};

const migrationSlice = createSlice({
  name: 'migration',
  initialState,
  reducers: {
    setSourceCode: (state, action: PayloadAction<string>) => {
      state.currentJob.sourceCode = action.payload;
    },
    setSourceFramework: (state, action: PayloadAction<'testcafe' | 'cypress'>) => {
      state.currentJob.sourceFramework = action.payload;
    },
    updateGeneratedCode: (state, action: PayloadAction<string>) => {
      state.currentJob.generatedCode = action.payload;
      if (state.currentJob.status === 'reviewed') {
        state.currentJob.status = 'needs-edit';
      }
    },
    setStatus: (state, action: PayloadAction<MigrationStatus>) => {
      state.currentJob.status = action.payload;
    },
    setMigrationResult: (state, action: PayloadAction<{
      generatedCode: string;
      confidence: number;
      tokensUsed: number;
      warnings: string[];
    }>) => {
      state.currentJob.generatedCode = action.payload.generatedCode;
      state.currentJob.confidence = action.payload.confidence;
      state.currentJob.tokensUsed = action.payload.tokensUsed;
      state.currentJob.warnings = action.payload.warnings;
      state.currentJob.status = 'reviewed';
      state.currentJob.error = null;
    },
    setMigrationError: (state, action: PayloadAction<string>) => {
      state.currentJob.error = action.payload;
      state.currentJob.status = 'idle';
    },
    resetCurrentJob: (state) => {
      state.currentJob = initialJob;
    },
    // Batch actions
    addBatchJobs: (state, action: PayloadAction<Array<{ fileName: string, sourceCode: string, sourceFramework: 'testcafe' | 'cypress' }>>) => {
      const newJobs: MigrationJob[] = action.payload.map(file => ({
        ...initialJob,
        id: Math.random().toString(36).substr(2, 9),
        fileName: file.fileName,
        sourceCode: file.sourceCode,
        sourceFramework: file.sourceFramework,
      }));
      state.batchJobs = [...state.batchJobs, ...newJobs];
      state.isBatchMode = true;
    },
    selectBatchJob: (state, action: PayloadAction<string>) => {
      const job = state.batchJobs.find(j => j.id === action.payload);
      if (job) {
        state.currentJob = job;
      }
    },
    updateBatchJobStatus: (state, action: PayloadAction<{ id: string, status: MigrationStatus }>) => {
      const job = state.batchJobs.find(j => j.id === action.payload.id);
      if (job) {
        job.status = action.payload.status;
      }
      if (state.currentJob.id === action.payload.id) {
        state.currentJob.status = action.payload.status;
      }
    },
    clearBatch: (state) => {
      state.batchJobs = [];
      state.isBatchMode = false;
    }
  },
});

export const {
  setSourceCode,
  setSourceFramework,
  updateGeneratedCode,
  setStatus,
  setMigrationResult,
  setMigrationError,
  resetCurrentJob,
  addBatchJobs,
  selectBatchJob,
  updateBatchJobStatus,
  clearBatch,
} = migrationSlice.actions;

export default migrationSlice.reducer;
