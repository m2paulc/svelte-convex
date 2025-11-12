<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { Trash2Icon } from '@lucide/svelte';
	import { useAuth } from '@mmailaender/convex-better-auth-svelte/svelte';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { fade } from 'svelte/transition';
	import TaskForm from '../components/task-form.svelte';
	import { api } from '../convex/_generated/api';
	import type { Doc, Id } from '../convex/_generated/dataModel';

	let { data } = $props();

	// Auth state store
	const auth = useAuth();
	const isLoading = $derived(auth.isLoading && !data.currentUser);
	const isAuthenticated = $derived(auth.isAuthenticated || !!data.currentUser);

	// Use server-side fetched user data
	let user = $derived(data.currentUser);

	// Sign in/up form state
	let showSignIn = $state(true);
	let name = $state('');
	let email = $state('');
	let password = $state('');

	const query = useQuery(api.tasks.get, {});
	const client = useConvexClient();

	async function toggleIsComplete(task: Doc<'tasks'>) {
		try {
			await client.mutation(api.tasks.toggleTaskComplete, {
				_id: task._id,
				isCompleted: task.isCompleted
			});
		} catch (error) {
			console.error('Failed to toggle Complete: ', error);
		}
	}

	async function addTask(taskText: string) {
		try {
			await client.mutation(api.tasks.addNewTask, {
				text: taskText
			});
		} catch (error) {
			console.error('Failed to add Task: ', error);
		}
	}

	async function removeTask(id: Id<'tasks'>) {
		try {
			// convex mutation
			await client.mutation(api.tasks.removeTask, { id });
		} catch (error) {
			console.error('Failed to remove task: ', error);
		}
	}

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
		} catch (error) {
			console.error('Authentication error: ', error);
		}
	}

	// Sign out function
	async function signOut() {
		const result = await authClient.signOut();
		if (result.error) {
			console.error('Sign out error:', result.error);
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
		<!-- Sign-In Component -->
		<div class="flex w-full max-w-md flex-col gap-4 rounded-lg bg-white p-6 shadow-md">
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
	{:else if isAuthenticated}
		<h1>Welcome to SvelteKit with Convex</h1>
		<div class="mb-4 text-xl font-semibold text-gray-800">
			Hello {user?.name}!
		</div>

		<TaskForm {addTask} />
		{#if query.isLoading}
			Loading...
		{:else if query.error}
			failed to Load: {query.error.toString()}
		{:else}
			<fieldset>
				{#each query.data as task}
					<article class="listing" transition:fade>
						<label>
							<input
								type="checkbox"
								name={task.text}
								checked={task.isCompleted}
								onchange={() => toggleIsComplete(task)}
							/>
							<span class:completed={task.isCompleted}>
								<span class="task-item">{task.text}</span>
								<span><em> - Assigned: {task.assigner}</em></span>
							</span>
						</label>
						<button
							onclick={() => removeTask(task._id)}
							class="remove-button"
							aria-label="remove task"><Trash2Icon /></button
						>
					</article>
				{/each}
			</fieldset>
		{/if}
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
		<button
			onclick={signOut}
			class="cursor-pointer rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
		>
			Sign out
		</button>
	{/if}
</main>

<style>
	main {
		margin-top: 1.5rem;
	}
	h1 {
		text-align: center;
		padding: 1rem;
	}
	.completed {
		text-decoration: line-through;
	}
	.task-item {
		font-weight: bold;
	}
	.listing {
		margin: 1rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 1.2rem;
		font-weight: bold;
		padding: 6px;
		background-color: burlywood;
		border-radius: 5px;
		text-wrap: balance;
		overflow-wrap: break-word;
	}
	.remove-button {
		background-color: brown;
		color: aliceblue;
		outline: none;
	}
</style>
