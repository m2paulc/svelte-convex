<script lang="ts">
	import { useAuth } from '@mmailaender/convex-better-auth-svelte/svelte';
	import AuthForm from '../components/auth-form.svelte';
	import TaskPage from '../components/task-page.svelte';

	let { data } = $props();

	// Auth state store
	const auth = useAuth();
	const isLoading = $derived(auth.isLoading && !data.currentUser);
	const isAuthenticated = $derived(auth.isAuthenticated || !!data.currentUser);

	// Use server-side fetched user data
	let user = $derived(data.currentUser);

	// Fetch access token
	let accessToken = $state<string | null>(null);
	let tokenLoading = $state(false);

	async function fetchToken() {
		tokenLoading = true;
		try {
			const token = await auth.fetchAccessToken({ forceRefreshToken: true });
			accessToken = token;
		} catch (error) {
			console.error('Error fetching access token: ', error);
			accessToken = 'Error fetching token';
		} finally {
			tokenLoading = false;
		}
	}
</script>

<main class="container">
	{#if isLoading}
		<div class="text-lg text-gray-600">Loading...</div>
	{:else if !isAuthenticated}
		<AuthForm />
	{:else if isAuthenticated}
		<TaskPage {user} />
		<!-- Demo: Access Token Section -->
		<div class="mb-4 rounded-md bg-gray-50 p-4">
			<h3 class="mb-2 text-sm font-medium text-gray-700">Access Token Demo</h3>
			<button
				onclick={fetchToken}
				disabled={tokenLoading}
				class="cursor-pointer rounded-md bg-blue-600 px-3 py-1 text-sm text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
			>
				{tokenLoading ? 'Fetching...' : 'Fetch Access Token'}
			</button>
			{#if accessToken}
				<div class="mt-2 rounded border bg-white p-2 text-xs break-all text-gray-600">
					{accessToken.length > 50 ? accessToken.substring(0, 50) + '...' : accessToken}
				</div>
			{/if}
		</div>
	{/if}
</main>

<style>
	main {
		margin-top: 1.5rem;
	}
</style>
