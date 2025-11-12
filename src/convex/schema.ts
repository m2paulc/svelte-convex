/*
	Installed from @auth/svelte
*/

import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

const schema = defineSchema({
	tasks: defineTable({
		isCompleted: v.boolean(),
		text: v.string()
	})
});

export default schema;
