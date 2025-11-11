<script lang="ts">
	import { useConvexClient, useQuery } from 'convex-svelte';
	import TaskForm from '../components/task-form.svelte';
	import { api } from '../convex/_generated/api';
	import type { Doc } from '../convex/_generated/dataModel';

	// let newTask = $state('');

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

	function addTask() {
		// convex mutation to add newTask
		const data = Object.fromEntries(new FormData(event?.target as HTMLFormElement).entries());
		client.mutation(api.tasks.addNewTask, {
			text: data.newTask as string
		});
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
			<ul>
				{#each query.data as task}
					<li>
						<label>
							<input
								type="checkbox"
								name={task.text}
								checked={task.isCompleted}
								onchange={() => toggleIsComplete(task)}
							/>
							<span class="task-item">{task.text}</span>
							<span><em> - Assigned at: {task.assigner}</em></span>
						</label>
					</li>
				{/each}
			</ul>
		</fieldset>
	{/if}
</main>

<style>
	main {
		margin-top: 1.5rem;
	}
	h1 {
		--pico-font-family: Arial, sans-serif;
		--pico-font-weight: 400;
		--pico-typography-spacing-vertical: 0.5rem;
		text-align: center;
		padding: 1rem;
	}
	.task-item {
		font-weight: bold;
	}
</style>
