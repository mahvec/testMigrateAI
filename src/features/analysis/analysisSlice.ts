import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TestFailure {
  testName: string;
  category: 'assertion' | 'timeout' | 'selector' | 'environment' | 'flaky' | 'unknown';
  confidence: number;
  summary: string;
  lineNumbers?: number[];
}

export interface AnalysisState {
  logContent: string;
  failures: TestFailure[];
  stats: {
    total: number;
    passed: number;
    failed: number;
    flaky: number;
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: AnalysisState = {
  logContent: '',
  failures: [],
  stats: {
    total: 0,
    passed: 0,
    failed: 0,
    flaky: 0,
  },
  isLoading: false,
  error: null,
};

const analysisSlice = createSlice({
  name: 'analysis',
  initialState,
  reducers: {
    setLogContent: (state, action: PayloadAction<string>) => {
      state.logContent = action.payload;
    },
    setAnalysisResult: (state, action: PayloadAction<{ failures: TestFailure[], stats: any }>) => {
      state.failures = action.payload.failures;
      state.stats = action.payload.stats;
      state.isLoading = false;
      state.error = null;
    },
    setAnalysisLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setAnalysisError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    resetAnalysis: (state) => {
      return initialState;
    },
  },
});

export const {
  setLogContent,
  setAnalysisResult,
  setAnalysisLoading,
  setAnalysisError,
  resetAnalysis,
} = analysisSlice.actions;

export default analysisSlice.reducer;
