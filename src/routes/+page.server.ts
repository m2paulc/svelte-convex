import { api } from '$convex/_generated/api';
import { createConvexHttpClient } from '@mmailaender/convex-better-auth-svelte/sveltekit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, depends }) => {
	// load function
	depends('app:auth');

	// Only fetch user if token exists
	if (!locals.token) {
		return { currentUser: null };
	}

	const client = createConvexHttpClient({ token: locals.token });

	try {
		const currentUser = await client.query(api.auth.getCurrentUser, {});
		return { currentUser };
	} catch (error) {
		// If authentication fails, return null user
		console.error('Failed to fetch current user:', error);
		return { currentUser: null };
	}
};
