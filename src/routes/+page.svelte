<script lang="ts">
    import { onMount } from 'svelte';
    import Grid from '$lib/crossword/Grid.svelte';
    import type { PuzzleData } from '$lib/types';
    
    let puzzle: PuzzleData;
    let isLoaded = false;
    
    onMount(async () => {
        const response = await fetch('/crossword/example_puzzle/2025-01-27.json');
        puzzle = await response.json();
        isLoaded = true;
    });
</script>

{#if isLoaded}
    <Grid strokeWidth={1} puzzle={puzzle} />
{:else}
    <p>Loading...</p>
{/if}
