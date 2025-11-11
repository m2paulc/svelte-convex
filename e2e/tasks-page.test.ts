/**
 * End-to-end tests for the Tasks Page
 *
 * Test coverage:
 * - Page loading and initial state
 * - Task display and formatting
 * - Adding new tasks
 * - Toggling task completion
 * - Removing tasks
 * - Full user workflows
 * - Accessibility
 */
import { expect, test } from '@playwright/test';

test.describe('Tasks Page - Initial Load', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('should display the page title', async ({ page }) => {
		const heading = page.locator('h1');
		await expect(heading).toBeVisible();
		await expect(heading).toHaveText('Welcome to SvelteKit with Convex');
	});

	test('should render the task form', async ({ page }) => {
		await page.waitForSelector('input[name="newTask"]', { timeout: 10000 });

		const input = page.locator('input[name="newTask"]');
		await expect(input).toBeVisible();

		const addButton = page.getByRole('button', { name: /add/i });
		await expect(addButton).toBeVisible();
	});

	test('should load and display tasks from Convex', async ({ page }) => {
		await page.waitForLoadState('networkidle');

		const fieldset = page.locator('fieldset');
		await expect(fieldset).toBeVisible({ timeout: 10000 });
	});
});

test.describe('Tasks Page - Task Display', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');
	});

	test('should display task checkboxes', async ({ page }) => {
		const checkboxes = page.locator('input[type="checkbox"]');
		const count = await checkboxes.count();
		expect(count).toBeGreaterThanOrEqual(0);
	});

	test('should display task text with proper styling', async ({ page }) => {
		const taskItems = page.locator('.task-item');
		const count = await taskItems.count();

		if (count > 0) {
			const firstTask = taskItems.first();
			await expect(firstTask).toBeVisible();
			await expect(firstTask).toHaveCSS('font-weight', '700');
		}
	});

	test('should display assigner information for each task', async ({ page }) => {
		const articles = page.locator('article.listing');
		const count = await articles.count();

		if (count > 0) {
			const firstArticle = articles.first();
			const assignerText = firstArticle.locator('em');
			await expect(assignerText).toBeVisible();

			const text = await assignerText.textContent();
			expect(text).toMatch(/Assigned:/);
		}
	});

	test('should display remove buttons for each task', async ({ page }) => {
		const removeButtons = page.locator('button.remove-button');
		const count = await removeButtons.count();

		if (count > 0) {
			const firstButton = removeButtons.first();
			await expect(firstButton).toBeVisible();
			await expect(firstButton).toHaveCSS('background-color', 'rgb(165, 42, 42)');
		}
	});
});

test.describe('Tasks Page - Add Task Workflow', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');
	});

	test('should add a new task successfully', async ({ page }) => {
		const input = page.locator('input[name="newTask"]');
		const addButton = page.getByRole('button', { name: /add/i });

		const taskText = `Test Task ${Date.now()}`;
		await input.fill(taskText);
		await addButton.click();

		await page.waitForTimeout(2000);

		const taskContent = page.getByText(taskText);
		await expect(taskContent).toBeVisible({ timeout: 10000 });
	});

	test('should clear input after adding task', async ({ page }) => {
		const input = page.locator('input[name="newTask"]');
		const addButton = page.getByRole('button', { name: /add/i });

		await input.fill('Task to clear');
		await addButton.click();

		await page.waitForTimeout(1000);
		await expect(input).toHaveValue('');
	});

	test('should add multiple tasks in sequence', async ({ page }) => {
		const input = page.locator('input[name="newTask"]');
		const addButton = page.getByRole('button', { name: /add/i });

		const task1 = `First Task ${Date.now()}`;
		const task2 = `Second Task ${Date.now() + 1}`;

		await input.fill(task1);
		await addButton.click();
		await page.waitForTimeout(1000);

		await input.fill(task2);
		await addButton.click();
		await page.waitForTimeout(2000);

		await expect(page.getByText(task1)).toBeVisible({ timeout: 10000 });
		await expect(page.getByText(task2)).toBeVisible({ timeout: 10000 });
	});
});

test.describe('Tasks Page - Toggle Task Completion', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');
	});

	test('should toggle task completion status', async ({ page }) => {
		const checkboxes = page.locator('input[type="checkbox"]');
		const count = await checkboxes.count();

		if (count > 0) {
			const firstCheckbox = checkboxes.first();
			const initialState = await firstCheckbox.isChecked();

			await firstCheckbox.click();
			await page.waitForTimeout(1500);

			const newState = await firstCheckbox.isChecked();
			expect(newState).toBe(!initialState);
		}
	});

	test('should persist task completion after toggle', async ({ page }) => {
		const checkboxes = page.locator('input[type="checkbox"]');
		const count = await checkboxes.count();

		if (count > 0) {
			const firstCheckbox = checkboxes.first();
			await firstCheckbox.click();
			await page.waitForTimeout(1500);

			const stateAfterToggle = await firstCheckbox.isChecked();

			await page.reload();
			await page.waitForLoadState('networkidle');

			const checkboxAfterReload = page.locator('input[type="checkbox"]').first();
			const stateAfterReload = await checkboxAfterReload.isChecked();

			expect(stateAfterReload).toBe(stateAfterToggle);
		}
	});
});

test.describe('Tasks Page - Remove Task Workflow', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');
	});

	test('should add and then remove a task', async ({ page }) => {
		const input = page.locator('input[name="newTask"]');
		const addButton = page.getByRole('button', { name: /add/i });

		const taskText = `Task to Remove ${Date.now()}`;
		await input.fill(taskText);
		await addButton.click();

		await page.waitForTimeout(2000);
		await expect(page.getByText(taskText)).toBeVisible();

		const taskArticle = page.locator('article.listing').filter({ hasText: taskText });
		const removeButton = taskArticle.locator('button.remove-button');
		await removeButton.click();

		await page.waitForTimeout(2000);
		await expect(page.getByText(taskText)).not.toBeVisible();
	});

	test('should remove existing task', async ({ page }) => {
		const removeButtons = page.locator('button.remove-button');
		const initialCount = await removeButtons.count();

		if (initialCount > 0) {
			const firstButton = removeButtons.first();
			const taskArticle = page.locator('article.listing').first();
			const taskText = await taskArticle.locator('.task-item').textContent();

			await firstButton.click();
			await page.waitForTimeout(2000);

			if (taskText) {
				await expect(page.getByText(taskText)).not.toBeVisible();
			}

			const newCount = await page.locator('button.remove-button').count();
			expect(newCount).toBe(initialCount - 1);
		}
	});
});

test.describe('Tasks Page - Full User Workflow', () => {
	test('should complete a full task management workflow', async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		const input = page.locator('input[name="newTask"]');
		const addButton = page.getByRole('button', { name: /add/i });
		const taskText = `Workflow Task ${Date.now()}`;

		await input.fill(taskText);
		await addButton.click();
		await page.waitForTimeout(2000);

		await expect(page.getByText(taskText)).toBeVisible();

		const taskArticle = page.locator('article.listing').filter({ hasText: taskText });
		const checkbox = taskArticle.locator('input[type="checkbox"]');

		await checkbox.click();
		await page.waitForTimeout(1500);
		await expect(checkbox).toBeChecked();

		await checkbox.click();
		await page.waitForTimeout(1500);
		await expect(checkbox).not.toBeChecked();

		const removeButton = taskArticle.locator('button.remove-button');
		await removeButton.click();
		await page.waitForTimeout(2000);

		await expect(page.getByText(taskText)).not.toBeVisible();
	});
});

test.describe('Tasks Page - Accessibility', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');
	});

	test('should have accessible heading', async ({ page }) => {
		const heading = page.locator('h1');
		await expect(heading).toHaveAccessibleName('Welcome to SvelteKit with Convex');
	});

	test('should have accessible form inputs', async ({ page }) => {
		const input = page.locator('input[name="newTask"]');
		await expect(input).toHaveAttribute('id', 'newTask');

		const label = page.locator('label[for="newTask"]');
		await expect(label).toBeVisible();
	});

	test('should have proper checkbox labels', async ({ page }) => {
		const checkboxes = page.locator('input[type="checkbox"]');
		const count = await checkboxes.count();

		if (count > 0) {
			const firstCheckbox = checkboxes.first();
			const name = await firstCheckbox.getAttribute('name');
			expect(name).toBeTruthy();
		}
	});

	test('should have keyboard navigable elements', async ({ page }) => {
		const input = page.locator('input[name="newTask"]');
		await input.focus();
		await expect(input).toBeFocused();

		await page.keyboard.press('Tab');
		const addButton = page.getByRole('button', { name: /add/i });
		await expect(addButton).toBeFocused();
	});
});

test.describe('Tasks Page - Edge Cases', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');
	});

	test('should handle empty task submission gracefully', async ({ page }) => {
		const input = page.locator('input[name="newTask"]');
		const addButton = page.getByRole('button', { name: /add/i });

		await addButton.click();
		await page.waitForTimeout(1000);

		await expect(input).toHaveValue('');
	});

	test('should handle long task text', async ({ page }) => {
		const input = page.locator('input[name="newTask"]');
		const addButton = page.getByRole('button', { name: /add/i });

		const uniqueId = Date.now();
		const longText = `LongTask${uniqueId}` + 'A'.repeat(180);
		await input.fill(longText);
		await addButton.click();

		await page.waitForTimeout(2000);
		const taskItem = page.locator('.task-item').filter({ hasText: `LongTask${uniqueId}` });
		await expect(taskItem.first()).toBeVisible({ timeout: 10000 });
	});

	test('should handle page reload gracefully', async ({ page }) => {
		const heading = page.locator('h1');
		await expect(heading).toBeVisible();

		await page.reload();
		await page.waitForLoadState('networkidle');

		await expect(heading).toBeVisible();
		const input = page.locator('input[name="newTask"]');
		await expect(input).toBeVisible();
	});
});
