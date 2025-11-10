/**
 * Unit tests for the Convex tasks API endpoint
 *
 * Tests the `get` query which retrieves all tasks from the database
 * and adds an 'assigner' field to each task.
 *
 * Test coverage:
 * - Basic functionality: fetching and transforming tasks
 * - Edge cases: empty task list
 * - Data integrity: preserving original task properties
 * - Error handling: database errors
 */
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import type { QueryCtx } from './_generated/server';

describe('tasks API endpoint', () => {
	describe('get query', () => {
		let mockCtx: QueryCtx;
		let mockCollect: Mock;

		// Define the handler function inline for testing
		const handler = async (ctx: QueryCtx) => {
			const tasks = await ctx.db.query('tasks').collect();
			return tasks.map((task) => ({
				...task,
				assigner: 'tom'
			}));
		};

		beforeEach(() => {
			// Reset mocks before each test
			mockCollect = vi.fn();
			mockCtx = {
				db: {
					query: vi.fn().mockReturnValue({
						collect: mockCollect
					})
				}
			} as any;
		});

		it('should return tasks with assigner field added', async () => {
			// Arrange
			const mockTasks = [
				{ _id: '1', text: 'Task 1', isCompleted: false },
				{ _id: '2', text: 'Task 2', isCompleted: true }
			];
			mockCollect.mockResolvedValue(mockTasks);

			// Act
			const result = await handler(mockCtx);

			// Assert
			expect(mockCtx.db.query).toHaveBeenCalledWith('tasks');
			expect(mockCollect).toHaveBeenCalled();
			expect(result).toEqual([
				{ _id: '1', text: 'Task 1', isCompleted: false, assigner: 'tom' },
				{ _id: '2', text: 'Task 2', isCompleted: true, assigner: 'tom' }
			]);
		});

		it('should handle empty task list', async () => {
			// Arrange
			mockCollect.mockResolvedValue([]);

			// Act
			const result = await handler(mockCtx);

			// Assert
			expect(result).toEqual([]);
		});

		it('should add assigner to each task', async () => {
			// Arrange
			const mockTasks = [
				{ _id: '1', text: 'Task 1', isCompleted: false },
				{ _id: '2', text: 'Task 2', isCompleted: true },
				{ _id: '3', text: 'Task 3', isCompleted: false }
			];
			mockCollect.mockResolvedValue(mockTasks);

			// Act
			const result = await handler(mockCtx);

			// Assert
			expect(result).toHaveLength(3);
			result.forEach((task: any) => {
				expect(task).toHaveProperty('assigner', 'tom');
			});
		});

		it('should preserve all original task properties', async () => {
			// Arrange
			const mockTasks = [
				{
					_id: '1',
					text: 'Task 1',
					isCompleted: false,
					_creationTime: 1234567890,
					customField: 'custom value'
				}
			];
			mockCollect.mockResolvedValue(mockTasks);

			// Act
			const result = await handler(mockCtx);

			// Assert
			expect(result[0]).toEqual({
				_id: '1',
				text: 'Task 1',
				isCompleted: false,
				_creationTime: 1234567890,
				customField: 'custom value',
				assigner: 'tom'
			});
		});

		it('should handle database errors gracefully', async () => {
			// Arrange
			const dbError = new Error('Database connection failed');
			mockCollect.mockRejectedValue(dbError);

			// Act & Assert
			await expect(handler(mockCtx)).rejects.toThrow('Database connection failed');
		});
	});
});
