<script lang="ts">
  import Cell from './Cell.svelte';
  
  interface Props {
    n: number;
    strokeWidth?: number;
    borderWidth?: number;
    puzzle?: {
      board: {
        cells: any[];
        clueLists: ClueList[];
      }[];
    };
  }

  interface ClueList {
    id: number;
    clues: number[];
    name: string;
  }

  let { n = 5, strokeWidth = 1, borderWidth = 3, puzzle }: Props = $props();

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

  let cellSize = $derived(Math.floor(500 / n));
  let gridSize = $derived(n * cellSize + 2 * borderWidth);
  let cells = $state(generateInitialCells());
  let selectedCell = $state<CellData | null>(null);
  let highlightMode = $state<"row" | "column">("row");

  // Update the effect to set initial selection and mode
  $effect(() => {
    if (!selectedCell) {
      // Find first valid cell (type 1)
      const firstValidCell = cells.find(cell => cell.type === 1);
      selectedCell = firstValidCell || cells[0];
      highlightMode = "row";
    }
  });

  function generateInitialCells(): CellData[] {
    if (puzzle) {
      return puzzle.board[0].cells.map((cellData: any, i: number) => ({
        id: i,
        row: Math.floor(i / n),
        col: i % n,
        answer: cellData.answer || '',
        type: cellData.type,
        clues: cellData.clues || [],
        label: cellData.label,
        userInput: ''
      }));
    }
    return Array.from({ length: n * n }, (_, i) => ({
      id: i,
      row: Math.floor(i / n),
      col: i % n,
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
        const nextCol = (selectedCell.col + 1) % n;
        nextIndex = selectedCell.row * n + nextCol;
      } else {
        const nextRow = (selectedCell.row + 1) % n;
        nextIndex = nextRow * n + selectedCell.col;
      }

      selectedCell = cells[nextIndex];
    }
  }

  function generateGridPath(): string {
    const path = [];

    for (let i = 1; i < n; i++) {
      const x = Math.floor(i * cellSize) + borderWidth;
      path.push(`M ${x} ${borderWidth} V ${gridSize - borderWidth}`);
    }

    for (let i = 1; i < n; i++) {
      const y = Math.floor(i * cellSize) + borderWidth;
      path.push(`M ${borderWidth} ${y} H ${gridSize - borderWidth}`);
    }

    return path.join(" ");
  }

  function isHighlighted(cell: CellData): boolean {
    if (!selectedCell || !puzzle) return false;
  
    const selectedClueNumber = selectedCell.clues.find(clueNum => {
      const clueList = puzzle.board[0].clueLists.find(list => 
        list.name === (highlightMode === "row" ? "Across" : "Down")
      );
      return clueList?.clues.includes(clueNum);
    });
  
    // Include check for 0 since 0 is a valid clue number
    if (selectedClueNumber === undefined) return false;
  
    return cell.clues.includes(selectedClueNumber);
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="grid-container">
  <svg

    viewBox="0 0 {gridSize} {gridSize}"
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
          isHighlighted={isHighlighted(cell)}
          type={cell.type}
          onClick={() => handleClick(cell)}
        />
      {/each}
    </g>
    <g class="grid">
      <!-- Draw grid lines using single path -->
      <path
        d={generateGridPath()}
        stroke="dimgray"
        vector-effect="non-scaling-stroke"
      />
      <!-- Draw border rectangle -->
      <rect
        x={borderWidth / 2}
        y={borderWidth / 2}
        width={gridSize - borderWidth}
        height={gridSize - borderWidth}
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
