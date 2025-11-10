import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import Page from './+page.svelte';

// Mock the convex-svelte module
vi.mock('convex-svelte', () => ({
	useQuery: () => ({
		isLoading: false,
		error: null,
		data: [{ _id: '1', text: 'Test task', isCompleted: false, assigner: 'tom' }]
	}),
	setupConvex: vi.fn()
}));

// Mock the Convex API
vi.mock('../convex/_generated/api', () => ({
	api: {
		tasks: {
			get: 'tasks:get'
		}
	}
}));

describe('/+page.svelte', () => {
	it('should render h1', async () => {
		render(Page);

		const heading = page.getByRole('heading', { level: 1 });
		await expect.element(heading).toBeInTheDocument();
	});

	it('should render task list', async () => {
		render(Page);

		const list = page.getByRole('list');
		await expect.element(list).toBeInTheDocument();
	});

	it('should display task text', async () => {
		render(Page);

		const taskText = page.getByText('Test task');
		await expect.element(taskText).toBeInTheDocument();
	});

	it('should display assigner info', async () => {
		render(Page);

		const assignerText = page.getByText(/Assigned by: tom/);
		await expect.element(assignerText).toBeInTheDocument();
	});
});
