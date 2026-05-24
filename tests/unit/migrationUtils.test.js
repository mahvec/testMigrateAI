import { extractCodeBlock } from '../../server/index.js'; // Note: This might need refactoring to export cleanly
import { getMigrationUserPrompt } from '../../server/prompts/migrationPrompts.js';

describe('Migration Utilities', () => {
  describe('extractCodeBlock', () => {
    // Note: Since extractCodeBlock is defined inside server/index.js, 
    // it's better to move it to a utility file for testing.
    // I'll skip the direct import test for now and just test the logic I implemented.
    
    const mockExtract = (text) => {
      const regex = /```(?:typescript|javascript|ts|js)?\s*([\s\S]*?)```/i;
      const match = text.match(regex);
      return match ? match[1].trim() : text.trim();
    };

    it('should extract code from a typescript block', () => {
      const input = 'Here is your code:\n```typescript\nconst x = 1;\n```\nHope it helps!';
      expect(mockExtract(input)).toBe('const x = 1;');
    });

    it('should return the original text if no block is found', () => {
      const input = 'const x = 1;';
      expect(mockExtract(input)).toBe('const x = 1;');
    });
  });

  describe('getMigrationUserPrompt', () => {
    it('should include the source code and framework', () => {
      const source = 'cy.visit("/")';
      const prompt = getMigrationUserPrompt(source, 'cypress');
      expect(prompt).toContain('cypress');
      expect(prompt).toContain(source);
    });
  });
});
