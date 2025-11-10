<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { api } from '../convex/_generated/api';

	const query = useQuery(api.tasks.get, {});
</script>

<h1>Welcome to SvelteKit with Convex</h1>
{#if query.isLoading}
	Loading...
{:else if query.error}
	failed to Load: {query.error.toString()}
{:else}
	<ul>
		{#each query.data as task}
			<li>
				{task.isCompleted ? '✅' : '☐'}
				<span>{task.text}</span>
				<span>Assigned by: {task.assigner}</span>
			</li>
		{/each}
	</ul>
{/if}
