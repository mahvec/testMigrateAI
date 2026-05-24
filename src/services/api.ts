import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface MigrationRequest {
  sourceCode: string;
  sourceFramework: 'testcafe' | 'cypress';
  targetFramework: 'playwright';
  promptVersion?: string;
}

export interface MigrationResponse {
  generatedCode: string;
  promptVersion: string;
  tokensUsed: number;
  confidence: number;
  warnings: string[];
}

export interface AnalysisRequest {
  logContent: string;
  logFormat: 'json' | 'text';
  options?: {
    detectFlaky: boolean;
  };
}

export interface AnalysisResponse {
  failures: Array<{
    testName: string;
    category: string;
    confidence: number;
    summary: string;
  }>;
  stats: {
    total: number;
    passed: number;
    failed: number;
    flaky: number;
  };
}

export interface PromptTemplate {
  id: string;
  name: string;
  template: string;
  version: number;
  stats: {
    uses: number;
    approvalRate: number;
  };
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Migration', 'Analysis', 'Prompts'],
  endpoints: (builder) => ({
    migrate: builder.mutation<MigrationResponse, MigrationRequest>({
      query: (credentials) => ({
        url: 'migrate',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Migration'],
    }),
    analyse: builder.mutation<AnalysisResponse, AnalysisRequest>({
      query: (data) => ({
        url: 'analyse',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Analysis'],
    }),
    getPrompts: builder.query<{ prompts: PromptTemplate[] }, void>({
      query: () => 'prompts',
      providesTags: ['Prompts'],
    }),
  }),
});

export const { useMigrateMutation, useAnalyseMutation, useGetPromptsQuery } = api;
