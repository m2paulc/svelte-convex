<script lang="ts">
	import { Trash2Icon } from '@lucide/svelte';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { fade } from 'svelte/transition';
	import TaskForm from '../components/task-form.svelte';
	import { api } from '../convex/_generated/api';
	import type { Doc, Id } from '../convex/_generated/dataModel';

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
</script>

<main class="container">
	<h1>Welcome to SvelteKit with Convex</h1>
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
