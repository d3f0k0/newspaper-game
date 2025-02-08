<script lang="ts">
  import Cell from './Cell.svelte';
  import type { PuzzleData } from '../types';
  import { type CellData, puzzle } from './puzzle.svelte';
  
  interface Props {
    strokeWidth?: number;
    borderWidth?: number;
    puzzleData?: PuzzleData;
  }

  let { strokeWidth = 1, borderWidth = 3, puzzleData }: Props = $props();

  $effect(() => {
    puzzle.updatePuzzle(puzzleData);
  });
  
  let cellSize = $derived(Math.floor(500 / Math.max(puzzle.width,puzzle.height)));
  let gridWidth = $derived(puzzle.width * cellSize + 2 * borderWidth);
  let gridHeight = $derived(puzzle.height * cellSize + 2 * borderWidth);

  function handleClick(cell: CellData) {
    if (puzzle.selectedCell.id === cell.id) {
      // Only switch mode if cell has both across and down clues
      const hasAcrossClue = puzzle.clueLists
        .find(list => list.name === "Across")
        ?.clues.some(clueNum => cell.clues.includes(clueNum));
      
      const hasDownClue = puzzle.clueLists
        .find(list => list.name === "Down")
        ?.clues.some(clueNum => cell.clues.includes(clueNum));

      if (hasAcrossClue && hasDownClue) {
        puzzle.highlightMode = puzzle.highlightMode === "Across" ? "Down" : "Across";
      }
    } else {
      // Use the new selectCell method
      puzzle.selectCell(cell);
      
      // Keep current highlight mode unless cell doesn't have clues in that direction
      const hasClueInCurrentMode = puzzle.clueLists
        .find(list => list.name === puzzle.highlightMode)
        ?.clues.some(clueNum => cell.clues.includes(clueNum));
      
      if (!hasClueInCurrentMode) {
        puzzle.highlightMode = puzzle.highlightMode === "Across" ? "Down" : "Across";
      }
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (!puzzle.selectedCell) return;
    event.preventDefault();
    puzzle.handleKeyInput(event.key);
  }

  function generateGridPath(): string {
    const path = [];

    // Vertical lines
    for (let i = 1; i < puzzle.width; i++) {
      const x = Math.floor(i * cellSize) + borderWidth;
      path.push(`M ${x} ${borderWidth} V ${gridHeight - borderWidth}`);
    }

    // Horizontal lines
    for (let i = 1; i < puzzle.height; i++) {
      const y = Math.floor(i * cellSize) + borderWidth;
      path.push(`M ${borderWidth} ${y} H ${gridWidth - borderWidth}`);
    }

    return path.join(" ");
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="grid-container">
  <svg
    width={600}
    height={600}
    viewBox="0 0 {gridWidth} {gridHeight}"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g class="cells">
      {#each puzzle.cells as cell (cell.id)}
        <Cell
          x={cell.col * cellSize + borderWidth}
          y={cell.row * cellSize + borderWidth}
          width={cellSize}
          height={cellSize}
          label={cell.label}
          userInput={cell.userInput}
          isSelected={puzzle.selectedCell?.id === cell.id}
          highlightState={puzzle.selectedClue?.cells.includes(cell.id) ? 'main' : 'none'}
          type={cell.type}
          onClick={() => handleClick(cell)}
        />
      {/each}
    </g>
    <g class="grid">
      <path
        d={generateGridPath()}
        stroke="dimgray"
        vector-effect="non-scaling-stroke"
      />
      <rect
        x={borderWidth / 2}
        y={borderWidth / 2}
        width={gridWidth - borderWidth}
        height={gridHeight - borderWidth}
        fill="none"
        stroke="black"
        stroke-width={borderWidth}
      />
    </g>
  </svg>
</div>

<style>
  .grid-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
  }
</style>
