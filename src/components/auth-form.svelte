<script lang="ts">
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/auth-client';

	// Sign in/up form state
	let showSignIn = $state(true);
	let name = $state('');
	let email = $state('');
	let password = $state('');

	// Handle form submission
	async function handlePasswordSubmit(event: Event) {
		event.preventDefault();

		try {
			if (showSignIn) {
				await authClient.signIn.email(
					{
						email,
						password
					},
					{
						onError: (ctx) => {
							// replace with toast
							alert(ctx.error.message);
						}
					}
				);
			} else {
				await authClient.signUp.email(
					{
						name,
						email,
						password
					},
					{
						onError: (ctx) => {
							// replace with toast
							alert(ctx.error.message);
						}
					}
				);
			}

			// Force page reload to fetch fresh user data
			await goto('/', { invalidateAll: true });
		} catch (error) {
			console.error('Authentication error: ', error);
		}
	}

	// Toggle between sign-in and sign-up
	function toggleSignMode() {
		showSignIn = !showSignIn;

		// Clear form fields when toggling
		name = '';
		email = '';
		password = '';
	}
</script>

<!-- Sign-In Component -->
<div class="m-auto flex w-full max-w-md flex-col gap-4 rounded-lg bg-white p-6 shadow-md">
	<div>
		<!-- Logo goes here -->
		<p>NBG Application</p>
	</div>
	<h2 class="mb-6 text-center text-2xl font-bold text-gray-800">
		{showSignIn ? 'Sign In' : 'Sign Up'}
	</h2>
	<form onsubmit={handlePasswordSubmit} class="flex flex-col gap-4">
		{#if !showSignIn}
			<input
				bind:value={name}
				placeholder="Name"
				required
				class="rounded-md border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
			/>
		{/if}
		<input
			type="email"
			bind:value={email}
			placeholder="Email"
			required
			class="rounded-md border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
		/>
		<input
			type="password"
			bind:value={password}
			placeholder="Password"
			required
			class="rounded-md border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
		/>
		<button
			type="submit"
			class="cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
		>
			{showSignIn ? 'Sign in' : 'Sign up'}
		</button>
	</form>
	<p class="mt-4 text-center text-gray-600">
		{showSignIn ? "Don't have an account? " : 'Already have an account? '}
		<button
			type="button"
			onclick={toggleSignMode}
			class="cursor-pointer border-none bg-transparent text-blue-600 underline hover:text-blue-800"
		>
			{showSignIn ? 'Sign up' : 'Sign in'}
		</button>
	</p>
</div>
