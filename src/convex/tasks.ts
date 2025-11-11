import { v } from 'convex/values';
import { formatAsISO } from '../lib/utils/utils';
import { mutation, query } from './_generated/server';

const eventTime = new Date();
const dated = formatAsISO(eventTime);

export const get = query({
	args: {},
	handler: async (ctx) => {
		const tasks = await ctx.db.query('tasks').collect();
		return tasks.map((task) => ({
			...task,
			assigner: dated
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
