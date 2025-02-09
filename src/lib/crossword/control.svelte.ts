import {puzzle, type CellData} from "./puzzle.svelte";
import {  } from "../types";

class Control {
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
        if (puzzle.highlightMode === direction) {
            this.moveInCurrentDirection(step);
        } else {
            puzzle.highlightMode = direction;
        }
    }

    private moveInCurrentDirection(step: 1 | -1) {
        const current = puzzle.selectedCell;
        let nextCell: CellData | undefined;

        if (puzzle.highlightMode === "Across") {
            // Get current clue cells for Across direction
            const currentClueNumber = current.clues.find(clueNum => 
                puzzle.clueLists.find(list => list.name === "Across")
                ?.clues.includes(clueNum)
            );
            const currentClue = currentClueNumber !== undefined 
                ? puzzle.puzzleData?.board[0].clues[currentClueNumber]
                : undefined;

            if (!currentClue) return;

            // Find current position in clue cells
            const clueIndices = currentClue.cells;
            const currentIndex = clueIndices.indexOf(current.id);
            
            if (step > 0 && currentIndex === clueIndices.length - 1) {
                // At end of clue, find next valid clue cell
                const nextValidCell = puzzle.cells.find(cell => 
                    cell.row === current.row && 
                    cell.col > current.col && 
                    cell.type === 1 &&
                    cell.clues.some(clueNum => 
                        puzzle.clueLists.find(list => list.name === "Across")
                        ?.clues.includes(clueNum)
                    )
                );
                if (nextValidCell) {
                    nextCell = nextValidCell;
                }
            } else if (step < 0 && currentIndex === 0) {
                // At start of clue, find previous valid clue cell
                const prevValidCell = [...puzzle.cells]
                    .reverse()
                    .find(cell => 
                        cell.row === current.row && 
                        cell.col < current.col && 
                        cell.type === 1 &&
                        cell.clues.some(clueNum => 
                            puzzle.clueLists.find(list => list.name === "Across")
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
                    nextCell = puzzle.cells.find(cell => cell.id === nextIndex);
                }
            }
        } else {
            // Similar logic for Down direction
            const currentClueNumber = current.clues.find(clueNum => 
                puzzle.clueLists.find(list => list.name === "Down")
                ?.clues.includes(clueNum)
            );
            const currentClue = currentClueNumber !== undefined 
                ? puzzle.puzzleData?.board[0].clues[currentClueNumber]
                : undefined;

            if (!currentClue) return;

            const clueIndices = currentClue.cells;
            const currentIndex = clueIndices.indexOf(current.id);
            
            if (step > 0 && currentIndex === clueIndices.length - 1) {
                const nextValidCell = puzzle.cells.find(cell => 
                    cell.col === current.col && 
                    cell.row > current.row && 
                    cell.type === 1 &&
                    cell.clues.some(clueNum => 
                        puzzle.clueLists.find(list => list.name === "Down")
                        ?.clues.includes(clueNum)
                    )
                );
                if (nextValidCell) {
                    nextCell = nextValidCell;
                }
            } else if (step < 0 && currentIndex === 0) {
                const prevValidCell = [...puzzle.cells]
                    .reverse()
                    .find(cell => 
                        cell.col === current.col && 
                        cell.row < current.row && 
                        cell.type === 1 &&
                        cell.clues.some(clueNum => 
                            puzzle.clueLists.find(list => list.name === "Down")
                            ?.clues.includes(clueNum)
                        )
                    );
                if (prevValidCell) {
                    nextCell = prevValidCell;
                }
            } else {
                const nextIndex = clueIndices[currentIndex + step];
                if (nextIndex !== undefined) {
                    nextCell = puzzle.cells.find(cell => cell.id === nextIndex);
                }
            }
        }

        if (nextCell) {
            puzzle.currentCellId = nextCell.id;
        }
    }

    private updateCellInput(input: string) {
        const newCells = [...puzzle.cells];
        const cellToUpdate = newCells.find((c) => c.id === puzzle.currentCellId);
        if (cellToUpdate) {
            cellToUpdate.userInput = input.toUpperCase();
            puzzle.cells = newCells;
        }
    }
}

const control = new Control()
export {control}