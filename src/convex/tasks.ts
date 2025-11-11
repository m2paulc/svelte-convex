import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const get = query({
	args: {},
	handler: async (ctx) => {
		const tasks = await ctx.db.query('tasks').collect();
		return tasks.map((task) => ({
			...task,
			assigner: 'tom'
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
