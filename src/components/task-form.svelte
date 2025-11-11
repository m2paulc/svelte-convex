<script lang="ts">
	let newTask = $state('');
	let { addTask }: { addTask: (newTask: string) => void } = $props();

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		addTask(newTask);
		newTask = '';
	}
</script>

<form onsubmit={handleSubmit}>
	<label for="newTask"
		>Enter New Task:
		<input id="newTask" name="newTask" bind:value={newTask} />
	</label>
	<button type="submit" class="secondary">Add</button>
</form>
