export interface PuzzleData {
    board: {
        cells: Array<{
            answer?: string;
            type?: number;
            clues?: number[];
            label?: string;
        }>;
        clueLists: ClueList[];
        clues: Clue[];
        dimensions: {
            width: number;
            height: number;
        };
    }[];
}

export interface Clue {
    cells: number[];
    direction: "Across" | "Down";
    label: string;
    text: Array<{
        plain: string
    }>
    relatives?: number[];
}

// Update ClueList interface
export interface ClueList {
    clues: number[];
    name: "Across" | "Down";  // Restrict to literal types
}