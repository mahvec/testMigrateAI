import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import helmet from 'helmet';
import axios from 'axios';
import { MIGRATION_SYSTEM_PROMPT, getMigrationUserPrompt } from './prompts/migrationPrompts.js';
import { ANALYSIS_SYSTEM_PROMPT, getAnalysisUserPrompt } from './prompts/analysisPrompts.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Helper to extract code from markdown blocks
const extractCodeBlock = (text) => {
  const regex = /```(?:typescript|javascript|ts|js)?\s*([\s\S]*?)```/i;
  const match = text.match(regex);
  return match ? match[1].trim() : text.trim();
};

// Helper to extract JSON from LLM response
const extractJSON = (text) => {
  try {
    const regex = /({[\s\S]*})/;
    const match = text.match(regex);
    return JSON.parse(match ? match[1] : text);
  } catch (e) {
    return null;
  }
};

/**
 * Unified LLM caller for multiple providers including OpenRouter
 */
const callLLM = async ({ system, prompt, temperature = 0.1, max_tokens = 4096 }) => {
  const provider = process.env.LLM_PROVIDER || 'anthropic';
  const model = process.env.LLM_MODEL;

  if (provider === 'openrouter') {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error('OpenRouter API key missing');

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: model || 'anthropic/claude-3.5-sonnet',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt }
        ],
        temperature,
        max_tokens
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/mahvec/testmigrate-ai', // Optional: for OpenRouter rankings
          'X-Title': 'TestMigrate AI'
        },
      }
    );
    return {
      text: response.data.choices[0].message.content,
      tokens: response.data.usage?.total_tokens || 0
    };
  }

  if (provider === 'anthropic') {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('Anthropic API key missing');

    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: model || 'claude-3-sonnet-20240229',
        max_tokens,
        system,
        messages: [{ role: 'user', content: prompt }],
        temperature,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
      }
    );
    return {
      text: response.data.content[0].text,
      tokens: response.data.usage?.output_tokens || 0
    };
  } 
  
  if (provider === 'openai') {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OpenAI API key missing');

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: model || 'gpt-4o',
        max_completion_tokens: max_tokens,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt }
        ],
        temperature,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return {
      text: response.data.choices[0].message.content,
      tokens: response.data.usage?.completion_tokens || 0
    };
  }

  throw new Error(`Unsupported LLM provider: ${provider}`);
};

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    provider: process.env.LLM_PROVIDER || 'anthropic',
    model: process.env.LLM_MODEL || 'default',
    message: 'TestMigrate AI Backend is running' 
  });
});

// Migration endpoint
app.post('/api/migrate', async (req, res) => {
  const { sourceCode, sourceFramework } = req.body;

  if (!sourceCode) {
    return res.status(400).json({ error: 'No source code provided' });
  }

  try {
    const result = await callLLM({
      system: MIGRATION_SYSTEM_PROMPT,
      prompt: getMigrationUserPrompt(sourceCode, sourceFramework),
      temperature: 0.1
    });

    res.json({
      generatedCode: extractCodeBlock(result.text),
      promptVersion: '1.0',
      tokensUsed: result.tokens,
      confidence: 0.9,
      warnings: [],
    });
  } catch (error) {
    console.error('Migration Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Migration failed',
      details: error.response?.data?.error?.message || error.message,
    });
  }
});

// Analysis endpoint
app.post('/api/analyse', async (req, res) => {
  const { logContent } = req.body;

  if (!logContent) {
    return res.status(400).json({ error: 'No log content provided' });
  }

  try {
    const result = await callLLM({
      system: ANALYSIS_SYSTEM_PROMPT,
      prompt: getAnalysisUserPrompt(logContent),
      temperature: 0
    });

    const analysis = extractJSON(result.text);

    if (!analysis) {
      throw new Error('Failed to parse analysis JSON from LLM');
    }

    res.json(analysis);
  } catch (error) {
    console.error('Analysis Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Analysis failed',
      details: error.response?.data?.error?.message || error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} using ${process.env.LLM_PROVIDER || 'anthropic'}`);
});
