<script lang="ts">
  import Cell from './Cell.svelte';
  import type { ClueList, PuzzleData } from '../types';
  
  // Update Props interface to include proper typing for puzzle
  interface Props {
    strokeWidth?: number;
    borderWidth?: number;
    puzzle?: PuzzleData;
  }

  let { strokeWidth = 1, borderWidth = 3, puzzle }: Props = $props();

  // Use dimensions from puzzle data
  let width = $derived(puzzle?.board[0].dimensions.width || 5);
  let height = $derived(puzzle?.board[0].dimensions.height || 5);

  interface CellData {
    id: number;
    row: number;
    col: number;
    answer: string;
    type?: number;
    clues: number[];
    label?: string;
    userInput?: string;
  }

  let cellSize = $derived(Math.floor(500 / Math.max(width, height)));
  let gridWidth = $derived(width * cellSize + 2 * borderWidth);
  let gridHeight = $derived(height * cellSize + 2 * borderWidth);
  let cells = $state(generateInitialCells());
  let selectedCell = $state<CellData | null>(null);
  let highlightMode = $state<"row" | "column">("row");

  $effect(() => {
    if (!selectedCell) {
      const firstValidCell = cells.find(cell => cell.type === 1);
      selectedCell = firstValidCell || cells[0];
      highlightMode = "row";
    }
  });

  function generateInitialCells(): CellData[] {
    if (puzzle) {
      return puzzle.board[0].cells.map((cellData, i: number) => ({
        id: i,
        row: Math.floor(i / width),
        col: i % width,
        answer: cellData.answer || '',
        type: cellData.type,
        clues: cellData.clues || [],
        label: cellData.label,
        userInput: ''
      }));
    }
    return Array.from({ length: width * height }, (_, i) => ({
      id: i,
      row: Math.floor(i / width),
      col: i % width,
      answer: '',
      clues: [],
      userInput: ''
    }));
  }

  function handleClick(cell: CellData) {
    if (selectedCell?.id === cell.id) {
      // Only switch mode if cell has both across and down clues
      const hasAcrossClue = puzzle?.board[0].clueLists
        .find(list => list.name === "Across")
        ?.clues.some(clueNum => cell.clues.includes(clueNum));
      
      const hasDownClue = puzzle?.board[0].clueLists
        .find(list => list.name === "Down")
        ?.clues.some(clueNum => cell.clues.includes(clueNum));

      if (hasAcrossClue && hasDownClue) {
        highlightMode = highlightMode === "row" ? "column" : "row";
      }
    } else {
      selectedCell = cell;
      // Keep current highlight mode unless cell doesn't have clues in that direction
      const hasClueInCurrentMode = puzzle?.board[0].clueLists
        .find(list => list.name === (highlightMode === "row" ? "Across" : "Down"))
        ?.clues.some(clueNum => cell.clues.includes(clueNum));
      
      if (!hasClueInCurrentMode) {
        highlightMode = highlightMode === "row" ? "column" : "row";
      }
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (!selectedCell) return;

    if (event.key.length === 1) {
      event.preventDefault();

      const newCells = [...cells];
      const cellToUpdate = newCells.find((c) => c.id === selectedCell!.id);
      if (cellToUpdate) {
        cellToUpdate.userInput = event.key.toUpperCase();
        cells = newCells;
      }

      const currentIndex = selectedCell.id;
      let nextIndex: number;

      if (highlightMode === "row") {
        const nextCol = (selectedCell.col + 1) % width;
        nextIndex = selectedCell.row * width + nextCol;
      } else {
        const nextRow = (selectedCell.row + 1) % height;
        nextIndex = nextRow * width + selectedCell.col;
      }

      selectedCell = cells[nextIndex];
    }
  }

  function generateGridPath(): string {
    const path = [];

    // Vertical lines
    for (let i = 1; i < width; i++) {
      const x = Math.floor(i * cellSize) + borderWidth;
      path.push(`M ${x} ${borderWidth} V ${gridHeight - borderWidth}`);
    }

    // Horizontal lines
    for (let i = 1; i < height; i++) {
      const y = Math.floor(i * cellSize) + borderWidth;
      path.push(`M ${borderWidth} ${y} H ${gridWidth - borderWidth}`);
    }

    return path.join(" ");
  }

  function getCurrentDirection(): "Across" | "Down" {
    return highlightMode === "row" ? "Across" : "Down";
  }

  function findClueList(direction: "Across" | "Down"): ClueList | undefined {
    return puzzle?.board[0].clueLists.find(list => list.name === direction);
  }

  function findSelectedClueNumber(): number | undefined {
    if (!selectedCell) return undefined;
    
    const direction = getCurrentDirection();
    const clueList = findClueList(direction);
    
    return selectedCell.clues.find(clueNum => 
      clueList?.clues.includes(clueNum)
    );
  }

  function getHighlightState(cell: CellData): 'none' | 'main' | 'related' {
    if (!selectedCell || !puzzle) return 'none';

    const selectedClueNumber = findSelectedClueNumber();
    if (selectedClueNumber === undefined) return 'none';

    // Check if cell is part of main clue
    if (cell.clues.includes(selectedClueNumber)) {
        return 'main';
    }

    // Find the current clue
    const direction = getCurrentDirection();
    const selectedClueIndex = puzzle.board[0].clues.findIndex(clue => 
        clue.cells.includes(selectedCell.id) && 
        clue.direction === direction
    );

    if (selectedClueIndex === -1) return 'none';

    const selectedClue = puzzle.board[0].clues[selectedClueIndex];

    // Check for related clues using array indices
    if (selectedClue?.relatives) {
        // Look for cells that are part of any relative clue
        const isRelated = selectedClue.relatives.some(relativeIndex => {
            const relativeClue = puzzle.board[0].clues[relativeIndex];
            return relativeClue?.cells.includes(cell.id);
        });

        if (isRelated) {
            return 'related';
        }
    }

    return 'none';
}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="grid-container">
  <svg
    width = 600
    height = 600
    viewBox="0 0 {gridWidth} {gridHeight}"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g class="cells">
      {#each cells as cell (cell.id)}
        <Cell
          x={cell.col * cellSize + borderWidth}
          y={cell.row * cellSize + borderWidth}
          width={cellSize}
          height={cellSize}
          label={cell.label}
          userInput={cell.userInput}
          isSelected={selectedCell?.id === cell.id}
          highlightState={getHighlightState(cell)}
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
