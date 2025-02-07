<script>
// @ts-nocheck

    import Grid from '$lib/crossword/Grid.svelte';
    import puzzle from "$lib/crossword/example_puzzle/2025-02-03.json";
  </script>
  
  <Grid n={15} strokeWidth={1} puzzle={puzzle} />
