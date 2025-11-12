<script lang="ts">
	import { goto } from '$app/navigation';
	import { api } from '$convex/_generated/api';
	import { authClient } from '$lib/auth-client';
	import { Trash2Icon } from '@lucide/svelte';
	import { useAuth } from '@mmailaender/convex-better-auth-svelte/svelte';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import type { FunctionReturnType } from 'convex/server';
	import { fade } from 'svelte/transition';
	import type { Doc, Id } from '../convex/_generated/dataModel';
	import TaskForm from './task-form.svelte';

	interface Props {
		user: FunctionReturnType<typeof api.auth.getCurrentUser> | null;
	}

	let { user }: Props = $props();

	// Auth state store
	const auth = useAuth();

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

	// Sign out function
	async function signOut() {
		const result = await authClient.signOut();
		if (result.error) {
			console.error('Sign out error:', result.error);
			return;
		}
		// Force re-run of +page.server.ts load function
		await goto('/', { invalidateAll: true }); // invalidate all
	}
</script>

<!-- Main page -->
<h1>Welcome to SvelteKit with Convex</h1>
<header class="align-center mb-4 flex justify-between">
	<div class="text-xl font-semibold text-gray-800">
		Hello {user?.name}!
	</div>
	<button
		onclick={signOut}
		class="cursor-pointer rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
	>
		Sign out
	</button>
</header>
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
				<button onclick={() => removeTask(task._id)} class="remove-button" aria-label="remove task"
					><Trash2Icon /></button
				>
			</article>
		{/each}
	</fieldset>
{/if}

<style>
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
