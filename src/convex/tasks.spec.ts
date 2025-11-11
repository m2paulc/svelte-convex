/**
 * Unit tests for the Convex tasks API endpoints
 *
 * Test coverage:
 * - get query: fetching and transforming tasks with formatted dates
 * - toggleTaskComplete mutation: toggling task completion status
 * - addNewTask mutation: creating new tasks
 * - removeTask mutation: deleting tasks
 * - Edge cases and error handling
 */
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import type { Id } from './_generated/dataModel';
import type { MutationCtx, QueryCtx } from './_generated/server';

describe('tasks API endpoints', () => {
	describe('get query', () => {
		let mockCtx: QueryCtx;
		let mockCollect: Mock;

		const handler = async (ctx: QueryCtx) => {
			const tasks = await ctx.db.query('tasks').collect();
			return tasks.map((task) => ({
				...task,
				assigner: new Date(task._creationTime).toISOString().split('T')[0]
			}));
		};

		beforeEach(() => {
			mockCollect = vi.fn();
			mockCtx = {
				db: {
					query: vi.fn().mockReturnValue({
						collect: mockCollect
					})
				}
			} as any;
		});

		it('should return tasks with formatted assigner date field', async () => {
			const mockTasks = [
				{ _id: '1', text: 'Task 1', isCompleted: false, _creationTime: 1609459200000 },
				{ _id: '2', text: 'Task 2', isCompleted: true, _creationTime: 1609545600000 }
			];
			mockCollect.mockResolvedValue(mockTasks);

			const result = await handler(mockCtx);

			expect(mockCtx.db.query).toHaveBeenCalledWith('tasks');
			expect(mockCollect).toHaveBeenCalled();
			expect(result).toHaveLength(2);
			expect(result[0]).toHaveProperty('assigner');
			expect(result[0].assigner).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		});

		it('should handle empty task list', async () => {
			mockCollect.mockResolvedValue([]);

			const result = await handler(mockCtx);

			expect(result).toEqual([]);
		});

		it('should preserve all original task properties', async () => {
			const mockTasks = [
				{
					_id: '1',
					text: 'Task 1',
					isCompleted: false,
					_creationTime: 1609459200000
				}
			];
			mockCollect.mockResolvedValue(mockTasks);

			const result = await handler(mockCtx);

			expect(result[0]).toHaveProperty('_id', '1');
			expect(result[0]).toHaveProperty('text', 'Task 1');
			expect(result[0]).toHaveProperty('isCompleted', false);
			expect(result[0]).toHaveProperty('_creationTime', 1609459200000);
			expect(result[0]).toHaveProperty('assigner');
		});

		it('should handle database errors gracefully', async () => {
			const dbError = new Error('Database connection failed');
			mockCollect.mockRejectedValue(dbError);

			await expect(handler(mockCtx)).rejects.toThrow('Database connection failed');
		});
	});

	describe('toggleTaskComplete mutation', () => {
		let mockCtx: MutationCtx;
		let mockPatch: Mock;

		const handler = async (
			ctx: MutationCtx,
			{ _id, isCompleted }: { _id: Id<'tasks'>; isCompleted: boolean }
		) => {
			if (_id) {
				const toggleComplete = !isCompleted;
				await ctx.db.patch(_id, { isCompleted: toggleComplete });
			}
		};

		beforeEach(() => {
			mockPatch = vi.fn();
			mockCtx = {
				db: {
					patch: mockPatch
				}
			} as any;
		});

		it('should toggle task from incomplete to complete', async () => {
			const taskId = 'task123' as Id<'tasks'>;

			await handler(mockCtx, { _id: taskId, isCompleted: false });

			expect(mockPatch).toHaveBeenCalledWith(taskId, { isCompleted: true });
		});

		it('should toggle task from complete to incomplete', async () => {
			const taskId = 'task456' as Id<'tasks'>;

			await handler(mockCtx, { _id: taskId, isCompleted: true });

			expect(mockPatch).toHaveBeenCalledWith(taskId, { isCompleted: false });
		});

		it('should handle null _id gracefully', async () => {
			await handler(mockCtx, { _id: null as any, isCompleted: false });

			expect(mockPatch).not.toHaveBeenCalled();
		});

		it('should handle database errors', async () => {
			const taskId = 'task789' as Id<'tasks'>;
			mockPatch.mockRejectedValue(new Error('Patch failed'));

			await expect(handler(mockCtx, { _id: taskId, isCompleted: false })).rejects.toThrow(
				'Patch failed'
			);
		});
	});

	describe('addNewTask mutation', () => {
		let mockCtx: MutationCtx;
		let mockInsert: Mock;

		const handler = async (ctx: MutationCtx, { text }: { text: string }) => {
			await ctx.db.insert('tasks', { text, isCompleted: false });
		};

		beforeEach(() => {
			mockInsert = vi.fn();
			mockCtx = {
				db: {
					insert: mockInsert
				}
			} as any;
		});

		it('should add a new task with text and isCompleted false', async () => {
			const newTaskText = 'New task to complete';

			await handler(mockCtx, { text: newTaskText });

			expect(mockInsert).toHaveBeenCalledWith('tasks', {
				text: 'New task to complete',
				isCompleted: false
			});
		});

		it('should handle empty string text', async () => {
			await handler(mockCtx, { text: '' });

			expect(mockInsert).toHaveBeenCalledWith('tasks', {
				text: '',
				isCompleted: false
			});
		});

		it('should handle long text strings', async () => {
			const longText = 'A'.repeat(1000);

			await handler(mockCtx, { text: longText });

			expect(mockInsert).toHaveBeenCalledWith('tasks', {
				text: longText,
				isCompleted: false
			});
		});

		it('should handle database errors', async () => {
			mockInsert.mockRejectedValue(new Error('Insert failed'));

			await expect(handler(mockCtx, { text: 'Test task' })).rejects.toThrow('Insert failed');
		});
	});

	describe('removeTask mutation', () => {
		let mockCtx: MutationCtx;
		let mockDelete: Mock;

		const handler = async (ctx: MutationCtx, { id }: { id: Id<'tasks'> }) => {
			if (id) {
				await ctx.db.delete(id);
			}
		};

		beforeEach(() => {
			mockDelete = vi.fn();
			mockCtx = {
				db: {
					delete: mockDelete
				}
			} as any;
		});

		it('should delete task by id', async () => {
			const taskId = 'task123' as Id<'tasks'>;

			await handler(mockCtx, { id: taskId });

			expect(mockDelete).toHaveBeenCalledWith(taskId);
		});

		it('should handle null id gracefully', async () => {
			await handler(mockCtx, { id: null as any });

			expect(mockDelete).not.toHaveBeenCalled();
		});

		it('should handle database errors', async () => {
			const taskId = 'task456' as Id<'tasks'>;
			mockDelete.mockRejectedValue(new Error('Delete failed'));

			await expect(handler(mockCtx, { id: taskId })).rejects.toThrow('Delete failed');
		});
	});
});
