import { v } from 'convex/values';
import { formatAsISO } from '../lib/utils/utils';
import { mutation, query } from './_generated/server';

export const get = query({
	args: {},
	handler: async (ctx) => {
		const tasks = await ctx.db.query('tasks').collect();
		return tasks.map((task) => ({
			...task,
			assigner: formatAsISO(new Date(task._creationTime))
		}));
	}
});

export const toggleTaskComplete = mutation({
	args: { _id: v.id('tasks'), isCompleted: v.boolean() },
	handler: async (ctx, { _id, isCompleted }) => {
		if (_id) {
			const toggleComplete = !isCompleted;
			await ctx.db.patch(_id, { isCompleted: toggleComplete });
		}
	}
});

export const addNewTask = mutation({
	args: { text: v.string() },
	handler: async (ctx, { text }) => {
		await ctx.db.insert('tasks', { text, isCompleted: false });
	}
});

export const removeTask = mutation({
	args: { id: v.id('tasks') },
	handler: async (ctx, { id }) => {
		if (id) {
			await ctx.db.delete(id);
		}
	}
});
