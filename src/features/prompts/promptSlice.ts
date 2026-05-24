import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface PromptTemplate {
  id: string;
  name: string;
  template: string;
  version: number;
  lastUpdated: number;
}

export interface PromptState {
  templates: PromptTemplate[];
  selectedPromptId: string | null;
}

const initialState: PromptState = {
  templates: [
    {
      id: 'migration-v1',
      name: 'Standard Migration',
      template: 'Migrate the following ${sourceFramework} test code to Playwright (TypeScript)...',
      version: 1,
      lastUpdated: Date.now(),
    },
    {
      id: 'analysis-v1',
      name: 'Log Analysis',
      template: 'Analyze the following CI test logs and categorize any failures...',
      version: 1,
      lastUpdated: Date.now(),
    }
  ],
  selectedPromptId: 'migration-v1',
};

const promptSlice = createSlice({
  name: 'prompts',
  initialState,
  reducers: {
    updateTemplate: (state, action: PayloadAction<{ id: string, template: string }>) => {
      const prompt = state.templates.find(p => p.id === action.payload.id);
      if (prompt) {
        prompt.template = action.payload.template;
        prompt.version += 1;
        prompt.lastUpdated = Date.now();
      }
    },
    selectPrompt: (state, action: PayloadAction<string>) => {
      state.selectedPromptId = action.payload;
    }
  },
});

export const { updateTemplate, selectPrompt } = promptSlice.actions;
export default promptSlice.reducer;
