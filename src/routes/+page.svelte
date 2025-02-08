<script lang="ts">
    import { onMount } from 'svelte';
    import type { PuzzleData } from '$lib/types';
    import Crossword from '$lib/crossword/Crossword.svelte';
    
    let puzzle: PuzzleData;
    let isLoaded = false;
    
    onMount(async () => {
        const response = await fetch('/crossword/example_puzzle/2025-01-27.json');
        puzzle = await response.json();
        isLoaded = true;
    });
</script>

{#if isLoaded}
    <Crossword puzzle={puzzle} />
{:else}
    <p>Loading...</p>
{/if}
