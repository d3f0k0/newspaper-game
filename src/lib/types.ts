export interface PuzzleData {
    board: {
        cells: Array<{
            answer?: string;
            type?: number;
            clues?: number[];
            label?: string;
        }>;
        clueLists: ClueList[];
        clues: Array<{
            cells: number[];
            direction: "Across" | "Down";
            label: string;
            relatives?: number[];
        }>;
        dimensions: {
            width: number;
            height: number;
        };
    }[];
}

// Update ClueList interface
export interface ClueList {
    clues: number[];
    name: "Across" | "Down";  // Restrict to literal types
}