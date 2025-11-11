/**
 * Component tests for +page.svelte (main tasks page)
 *
 * Test coverage:
 * - Page rendering with mocked data
 * - Task list display with checkboxes and text
 * - Task form integration
 *
 * Note: These tests use mocked Convex data to avoid Convex connection issues
 */
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import type { Id } from '../convex/_generated/dataModel';
import Page from './+page.svelte';

// Mock convex-svelte before any imports
vi.mock('convex-svelte', () => ({
	useQuery: () => ({
		isLoading: false,
		error: null,
		data: [
			{
				_id: 'task1' as Id<'tasks'>,
				text: 'Buy groceries',
				isCompleted: false,
				assigner: '01-15-2024'
			},
			{
				_id: 'task2' as Id<'tasks'>,
				text: 'Complete project',
				isCompleted: true,
				assigner: '01-16-2024'
			}
		]
	}),
	useConvexClient: () => ({
		mutation: vi.fn().mockResolvedValue(undefined)
	})
}));

// Mock the Convex API
vi.mock('../convex/_generated/api', () => ({
	api: {
		tasks: {
			get: 'tasks:get',
			toggleTaskComplete: 'tasks:toggleTaskComplete',
			addNewTask: 'tasks:addNewTask',
			removeTask: 'tasks:removeTask'
		}
	}
}));

describe('+page.svelte', () => {
	it('should render page heading', async () => {
		render(Page);

		const heading = page.getByRole('heading', { level: 1 });
		await expect.element(heading).toBeInTheDocument();
		await expect.element(heading).toHaveTextContent('Welcome to SvelteKit with Convex');
	});

	it('should render task form', async () => {
		render(Page);

		const input = page.getByRole('textbox', { name: /enter new task/i });
		await expect.element(input).toBeInTheDocument();

		const addButton = page.getByRole('button', { name: /add/i });
		await expect.element(addButton).toBeInTheDocument();
	});

	it('should display all tasks', async () => {
		render(Page);

		const task1 = page.getByText('Buy groceries');
		await expect.element(task1).toBeInTheDocument();

		const task2 = page.getByText('Complete project');
		await expect.element(task2).toBeInTheDocument();
	});

	it('should render checkboxes for tasks', async () => {
		render(Page);

		const checkbox1 = page.getByRole('checkbox', { name: /buy groceries/i });
		await expect.element(checkbox1).toBeInTheDocument();

		const checkbox2 = page.getByRole('checkbox', { name: /complete project/i });
		await expect.element(checkbox2).toBeInTheDocument();
	});

	it('should show completed task as checked', async () => {
		render(Page);

		const completedCheckbox = page.getByRole('checkbox', { name: /complete project/i });
		await expect.element(completedCheckbox).toBeChecked();
	});

	it('should show incomplete task as unchecked', async () => {
		render(Page);

		const incompleteCheckbox = page.getByRole('checkbox', { name: /buy groceries/i });
		await expect.element(incompleteCheckbox).not.toBeChecked();
	});

	it('should display assigner dates', async () => {
		render(Page);

		const assigner1 = page.getByText(/Assigned: 01-15-2024/);
		await expect.element(assigner1).toBeInTheDocument();

		const assigner2 = page.getByText(/Assigned: 01-16-2024/);
		await expect.element(assigner2).toBeInTheDocument();
	});
});
