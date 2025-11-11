/**
 * Component tests for task-form.svelte
 *
 * Test coverage:
 * - Form rendering and accessibility
 * - User input handling
 * - Form submission
 * - Input clearing after submission
 * - Edge cases
 */
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import TaskForm from './task-form.svelte';

describe('TaskForm Component', () => {
	it('should render the form with label and input', async () => {
		const mockAddTask = vi.fn();
		render(TaskForm, { props: { addTask: mockAddTask } });

		const label = page.getByText('Enter New Task:');
		await expect.element(label).toBeInTheDocument();

		const input = page.getByRole('textbox', { name: /enter new task/i });
		await expect.element(input).toBeInTheDocument();
	});

	it('should render submit button', async () => {
		const mockAddTask = vi.fn();
		render(TaskForm, { props: { addTask: mockAddTask } });

		const button = page.getByRole('button', { name: /add/i });
		await expect.element(button).toBeInTheDocument();
		await expect.element(button).toHaveAttribute('type', 'submit');
	});

	it('should have correct input attributes', async () => {
		const mockAddTask = vi.fn();
		render(TaskForm, { props: { addTask: mockAddTask } });

		const input = page.getByRole('textbox', { name: /enter new task/i });
		await expect.element(input).toHaveAttribute('id', 'newTask');
		await expect.element(input).toHaveAttribute('name', 'newTask');
	});

	it('should update input value when user types', async () => {
		const mockAddTask = vi.fn();
		render(TaskForm, { props: { addTask: mockAddTask } });

		const input = page.getByRole('textbox', { name: /enter new task/i });
		await input.fill('New test task');

		await expect.element(input).toHaveValue('New test task');
	});

	it('should call addTask with input value on form submit', async () => {
		const mockAddTask = vi.fn();
		render(TaskForm, { props: { addTask: mockAddTask } });

		const input = page.getByRole('textbox', { name: /enter new task/i });
		await input.fill('Buy groceries');

		const button = page.getByRole('button', { name: /add/i });
		await button.click();

		expect(mockAddTask).toHaveBeenCalledWith('Buy groceries');
		expect(mockAddTask).toHaveBeenCalledTimes(1);
	});

	it('should clear input after successful submission', async () => {
		const mockAddTask = vi.fn();
		render(TaskForm, { props: { addTask: mockAddTask } });

		const input = page.getByRole('textbox', { name: /enter new task/i });
		await input.fill('Task to clear');

		const button = page.getByRole('button', { name: /add/i });
		await button.click();

		await expect.element(input).toHaveValue('');
	});

	it('should handle empty string submission', async () => {
		const mockAddTask = vi.fn();
		render(TaskForm, { props: { addTask: mockAddTask } });

		const button = page.getByRole('button', { name: /add/i });
		await button.click();

		expect(mockAddTask).toHaveBeenCalledWith('');
		expect(mockAddTask).toHaveBeenCalledTimes(1);
	});

	it('should handle multiple submissions', async () => {
		const mockAddTask = vi.fn();
		render(TaskForm, { props: { addTask: mockAddTask } });

		const input = page.getByRole('textbox', { name: /enter new task/i });
		const button = page.getByRole('button', { name: /add/i });

		await input.fill('First task');
		await button.click();

		await input.fill('Second task');
		await button.click();

		expect(mockAddTask).toHaveBeenCalledTimes(2);
		expect(mockAddTask).toHaveBeenNthCalledWith(1, 'First task');
		expect(mockAddTask).toHaveBeenNthCalledWith(2, 'Second task');
	});

	it('should handle long text input', async () => {
		const mockAddTask = vi.fn();
		render(TaskForm, { props: { addTask: mockAddTask } });

		const longText = 'A'.repeat(500);
		const input = page.getByRole('textbox', { name: /enter new task/i });
		await input.fill(longText);

		const button = page.getByRole('button', { name: /add/i });
		await button.click();

		expect(mockAddTask).toHaveBeenCalledWith(longText);
	});

	it('should have secondary class on button', async () => {
		const mockAddTask = vi.fn();
		render(TaskForm, { props: { addTask: mockAddTask } });

		const button = page.getByRole('button', { name: /add/i });
		await expect.element(button).toHaveClass('secondary');
	});

	it('should submit form when button is clicked', async () => {
		const mockAddTask = vi.fn();
		render(TaskForm, { props: { addTask: mockAddTask } });

		const input = page.getByRole('textbox', { name: /enter new task/i });
		await input.fill('Test submission');

		const button = page.getByRole('button', { name: /add/i });
		await button.click();

		expect(mockAddTask).toHaveBeenCalledWith('Test submission');
	});
});
