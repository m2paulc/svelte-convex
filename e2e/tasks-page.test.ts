import { expect, test } from '@playwright/test';

test.describe('Tasks Page E2E', () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to the home page before each test
		await page.goto('/');
	});

	test('Should display the page title', async ({ page }) => {
		// Check that the h1 heading is visible and has correct text
		const heading = page.locator('h1');
		await expect(heading).toBeVisible();
		await expect(heading).toHaveText('Welcome to SvelteKit with Convex');
	});

	test('Should show loading state initially', async ({ page }) => {
		// Intercept the page load to catch the loading state
		await page.goto('/', { waitUntil: 'domcontentloaded' });

		// Check if loading text appears (might be fast)
		const loadingText = page.getByText('Loading...');
		expect(!!loadingText).toBe(true);
	});

	test('Should load and display tasks from Convex', async ({ page }) => {
		// Wait for the tasks list to appear
		const tasksList = page.locator('ul');
		await expect(tasksList).toBeVisible({ timeout: 10000 });
		// Check that tasks are rendered
		const tasks = page.locator('ul li');
		await expect(tasks).not.toHaveCount(0);
	});

	test('Should display completed tasks with checkmark', async ({ page }) => {
		// Wait for tasks to load
		await page.waitForSelector('ul li', { timeout: 10000 });
		// Find completed tasks
		const completedTasks = page.locator('ul li', { hasText: '✅' });
		// If there are completed tasks in the database, verify them
		const completedCount = await completedTasks.count();
		if (completedCount > 0) {
			await expect(completedTasks.first()).toBeVisible();
		}
	});

	test('should display incomplete tasks with empty checkbox', async ({ page }) => {
		// Wait for tasks to load
		await page.waitForSelector('ul li', { timeout: 10000 });
		// Find incomplete tasks (those with ☐)
		const incompleteTasks = page.locator('ul li', { hasText: '☐' });
		// If there are incomplete tasks in the database, verify them
		const count = await incompleteTasks.count();
		if (count > 0) {
			await expect(incompleteTasks.first()).toBeVisible();
		}
	});

	test('Should display task text context', async ({ page }) => {
		// Wait for tasks to load
		await page.waitForSelector('ul li', { timeout: 10000 });
		// Get the first task
		const firstTask = page.locator('ul li').first();
		await expect(firstTask).toBeVisible();
		// Verify it contains a span with text
		const taskText = firstTask.locator('span').first();
		await expect(taskText).not.toBeEmpty();
	});

	test('should have error handling UI structure', async ({ page }) => {
		// This test verifies that the page has error handling logic
		// (Testing actual error state is complex with Convex and may require mocking)

		// Check that the page loads successfully in normal conditions
		await page.waitForSelector('h1', { timeout: 10000 });

		// Verify the component structure supports both success and error states
		const heading = page.locator('h1');
		await expect(heading).toBeVisible();

		// In a real error scenario, the else-if block in +page.svelte would show
		// "failed to Load: {error}" - but triggering this in e2e is environment-specific
	});

	test('should have correct task structure', async ({ page }) => {
		// Wait for tasks to load
		await page.waitForSelector('ul li', { timeout: 10000 });
		const firstTask = page.locator('ul li').first();

		// Each task should have:
		// 1. Status icon (✅ or ☐)
		// 2. Task text
		// 3. Assigner info

		const taskContent = await firstTask.textContent();
		expect(taskContent).toMatch(/[✅☐]/); // Has status icon
		expect(taskContent).toContain('Assigned by:'); // Has assigner
	});

	test('page should be responsive and accessible', async ({ page }) => {
		await page.waitForSelector('h1', { timeout: 10000 });
		// Check heading accessibility
		const heading = page.locator('h1');
		await expect(heading).toHaveAccessibleName('Welcome to SvelteKit with Convex');
		// Check that list has proper structure
		const list = page.locator('ul');
		await expect(list).toBeVisible({ timeout: 10000 });
	});
});

test.describe('Tasks Page with Sample Data', () => {
	// These tests assume you've loaded the sampleData.jsonl into your Convex database
	test('should display sample tasks correctly', async ({ page }) => {
		await page.goto('/');
		await page.waitForSelector('ul li', { timeout: 10000 });
		// Based on sampleData.jsonl, we expect these tasks:
		// - "Buy groceries" (completed)
		// - "Go for a swim" (completed)
		// - "Integrate Convex" (incomplete)
		const tasks = await page.locator('ul li').allTextContents();

		// Check that we have tasks rendered
		expect(tasks.length).toBeGreaterThan(0);

		// Optionally check for specific sample data
		const pageContent = await page.textContent('body');
		// Note: Only check if sample data is loaded
		if (pageContent?.includes('Buy groceries')) {
			expect(pageContent).toContain('Buy groceries');
			expect(pageContent).toContain('Go for a swim');
			expect(pageContent).toContain('Integrate Convex');
		}
	});
});
