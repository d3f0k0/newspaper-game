import type { PuzzleData, Clue } from "$lib/types";

export interface CellData {
    id: number;
    row: number;
    col: number;
    answer: string;
    type?: number;
    clues: number[];
    label?: string;
    userInput?: string;
}


class Puzzle {
    // From puzzle data
    puzzleData = $state<PuzzleData | undefined>();
    highlightMode = $state<"Across" | "Down">("Across");
    cells = $state<CellData[]>([]);
    currentCellId = $state<number>(0);  // Add this line
    clueLists = $derived(this.puzzleData?.board[0].clueLists ?? []);
    width = $derived(this.puzzleData?.board[0].dimensions.width || 5);
    height = $derived(this.puzzleData?.board[0].dimensions.height || 5);
    
    // Getter and setter
    constructor(initialData?: PuzzleData) {
        this.updatePuzzle(initialData);
    }
    updatePuzzle(newData?: PuzzleData) {
        this.puzzleData = newData;
        this.cells = generateCells(newData);
    }
    // selecting Cell
    selectedCell = $derived.by(() => {
        return this.cells.find(cell => cell.id === this.currentCellId) || this.cells[0];
    })
    selectCell(cell: CellData) {
        this.currentCellId = cell.id;
    }

    selectedClue = $derived.by<Clue | undefined>(() => {
        const acrossList = this.clueLists.find(list => list.name === "Across")?.clues || [];
        const downList = this.clueLists.find(list => list.name === "Down")?.clues || [];
        
        const selectedClueNumber = this.selectedCell.clues.find(clueNumber => {
            if (this.highlightMode === "Across") {
                return acrossList.includes(clueNumber);
            } else {
                return downList.includes(clueNumber);
            }
        });
        return selectedClueNumber !== undefined 
            ? this.puzzleData?.board[0].clues[selectedClueNumber]
            : undefined;
    });
}
const puzzle = new Puzzle()
export { puzzle }

function generateCells(puzzle?: PuzzleData): CellData[] {
    if (puzzle) {
        const width = puzzle.board[0].dimensions.width;
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
    return Array.from({ length: 15 * 15 }, (_, i) => ({
        id: i,
        row: Math.floor(i / 15),
        col: i % 15,
        answer: '',
        clues: [],
        userInput: ''
    }));
}

