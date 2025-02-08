// Cells generate cells by puzzle data
import { getContext, setContext } from "svelte";
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

    handleKeyInput(key: string) {
        switch (key) {
            case 'ArrowRight':
                this.handleArrowKey("Across", 1);
                break;
            case 'ArrowLeft':
                this.handleArrowKey("Across", -1);
                break;
            case 'ArrowDown':
                this.handleArrowKey("Down", 1);
                break;
            case 'ArrowUp':
                this.handleArrowKey("Down", -1);
                break;
            default:
                if (key.length === 1) {
                    this.updateCellInput(key);
                    this.moveInCurrentDirection(1);
                }
        }
    }

    private handleArrowKey(direction: "Across" | "Down", step: 1 | -1) {
        if (this.highlightMode === direction) {
            this.moveInCurrentDirection(step);
        } else {
            this.highlightMode = direction;
        }
    }

    private moveInCurrentDirection(step: 1 | -1) {
        const current = this.selectedCell;
        let nextCell: CellData | undefined;

        if (this.highlightMode === "Across") {
            // Get current clue cells for Across direction
            const currentClueNumber = current.clues.find(clueNum => 
                this.clueLists.find(list => list.name === "Across")
                ?.clues.includes(clueNum)
            );
            const currentClue = currentClueNumber !== undefined 
                ? this.puzzleData?.board[0].clues[currentClueNumber]
                : undefined;

            if (!currentClue) return;

            // Find current position in clue cells
            const clueIndices = currentClue.cells;
            const currentIndex = clueIndices.indexOf(current.id);
            
            if (step > 0 && currentIndex === clueIndices.length - 1) {
                // At end of clue, find next valid clue cell
                const nextValidCell = this.cells.find(cell => 
                    cell.row === current.row && 
                    cell.col > current.col && 
                    cell.type === 1 &&
                    cell.clues.some(clueNum => 
                        this.clueLists.find(list => list.name === "Across")
                        ?.clues.includes(clueNum)
                    )
                );
                if (nextValidCell) {
                    nextCell = nextValidCell;
                }
            } else if (step < 0 && currentIndex === 0) {
                // At start of clue, find previous valid clue cell
                const prevValidCell = [...this.cells]
                    .reverse()
                    .find(cell => 
                        cell.row === current.row && 
                        cell.col < current.col && 
                        cell.type === 1 &&
                        cell.clues.some(clueNum => 
                            this.clueLists.find(list => list.name === "Across")
                            ?.clues.includes(clueNum)
                        )
                    );
                if (prevValidCell) {
                    nextCell = prevValidCell;
                }
            } else {
                // Move within current clue
                const nextIndex = clueIndices[currentIndex + step];
                if (nextIndex !== undefined) {
                    nextCell = this.cells.find(cell => cell.id === nextIndex);
                }
            }
        } else {
            // Similar logic for Down direction
            const currentClueNumber = current.clues.find(clueNum => 
                this.clueLists.find(list => list.name === "Down")
                ?.clues.includes(clueNum)
            );
            const currentClue = currentClueNumber !== undefined 
                ? this.puzzleData?.board[0].clues[currentClueNumber]
                : undefined;

            if (!currentClue) return;

            const clueIndices = currentClue.cells;
            const currentIndex = clueIndices.indexOf(current.id);
            
            if (step > 0 && currentIndex === clueIndices.length - 1) {
                const nextValidCell = this.cells.find(cell => 
                    cell.col === current.col && 
                    cell.row > current.row && 
                    cell.type === 1 &&
                    cell.clues.some(clueNum => 
                        this.clueLists.find(list => list.name === "Down")
                        ?.clues.includes(clueNum)
                    )
                );
                if (nextValidCell) {
                    nextCell = nextValidCell;
                }
            } else if (step < 0 && currentIndex === 0) {
                const prevValidCell = [...this.cells]
                    .reverse()
                    .find(cell => 
                        cell.col === current.col && 
                        cell.row < current.row && 
                        cell.type === 1 &&
                        cell.clues.some(clueNum => 
                            this.clueLists.find(list => list.name === "Down")
                            ?.clues.includes(clueNum)
                        )
                    );
                if (prevValidCell) {
                    nextCell = prevValidCell;
                }
            } else {
                const nextIndex = clueIndices[currentIndex + step];
                if (nextIndex !== undefined) {
                    nextCell = this.cells.find(cell => cell.id === nextIndex);
                }
            }
        }

        if (nextCell) {
            this.currentCellId = nextCell.id;
        }
    }

    private updateCellInput(input: string) {
        const newCells = [...this.cells];
        const cellToUpdate = newCells.find((c) => c.id === this.currentCellId);
        if (cellToUpdate) {
            cellToUpdate.userInput = input.toUpperCase();
            this.cells = newCells;
        }
    }
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

