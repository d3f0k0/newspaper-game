<script lang="ts">
    let {puzzle} = $props();
    import Grid from "./Grid.svelte";
</script>



<Grid strokeWidth={1} puzzleData={puzzle} />
