export const MIGRATION_SYSTEM_PROMPT = `You are an expert test automation engineer specializing in migrating end-to-end test suites. 
Your task is to convert test scripts from legacy frameworks (Cypress or TestCafe) to Playwright.

Follow these rules strictly:
1. Output ONLY the migrated Playwright code. 
2. Wrap the code in a fenced code block using \`\`\`typescript.
3. Use modern Playwright best practices (Page Object Model if appropriate, Locators, etc.).
4. Ensure all assertions are converted correctly.
5. Do not include any introductory text or explanations outside the code block.`;

export const getMigrationUserPrompt = (sourceCode, sourceFramework) => {
  return `Migrate the following ${sourceFramework} test code to Playwright (TypeScript):

--- SOURCE CODE ---
${sourceCode}
--- END SOURCE CODE ---

Playwright Mapping Guidance:
- Use 'page' fixture in tests.
- Convert Cypress 'cy.get().click()' to 'await page.locator().click()'.
- Convert TestCafe 't.click()' to 'await page.locator().click()'.
- Ensure imports include '@playwright/test'.
`;
};
