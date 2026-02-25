import { useState } from "react";
import { Table } from "../../types";
import { Plus, Grid3x3, Square } from "lucide-react";
import Button from "../ui/button/Button";

interface Props {
    floor: number;
    tables: Table[];
    onSlotClick: (x: number, y: number, currentTable?: Table, spanX?: number, spanY?: number) => void;
}

interface CellSelection {
    x: number;
    y: number;
}

export default function TableLayoutEditor({ floor, tables, onSlotClick }: Props) {
    // Grid configuration: 8 Columns x 6 Rows
    const ROWS = 6;
    const COLS = 8;

    // Merge mode state
    const [mergeMode, setMergeMode] = useState(false);
    const [dragStart, setDragStart] = useState<CellSelection | null>(null);
    const [dragEnd, setDragEnd] = useState<CellSelection | null>(null);

    // Helper to find table at specific coordinate considering span
    const getTableAt = (x: number, y: number) => {
        return tables.find(t => {
            if (t.floor !== floor) return false;
            const spanX = t.span_x || 1;
            const spanY = t.span_y || 1;
            return x >= t.position_x && x < t.position_x + spanX &&
                y >= t.position_y && y < t.position_y + spanY;
        });
    };

    // Check if a cell should be skipped (it's part of a merged table)
    const shouldSkipCell = (x: number, y: number) => {
        const table = getTableAt(x, y);
        if (!table) return false;
        // If this is not the origin cell of the table, skip it
        return !(table.position_x === x && table.position_y === y);
    };

    // Check if cell is in current selection
    const isCellSelected = (x: number, y: number) => {
        if (!dragStart || !dragEnd) return false;
        const minX = Math.min(dragStart.x, dragEnd.x);
        const maxX = Math.max(dragStart.x, dragEnd.x);
        const minY = Math.min(dragStart.y, dragEnd.y);
        const maxY = Math.max(dragStart.y, dragEnd.y);
        return x >= minX && x <= maxX && y >= minY && y <= maxY;
    };

    // Handle cell mouse down in merge mode
    const handleCellMouseDown = (x: number, y: number) => {
        if (!mergeMode) return;
        // Only allow selection on empty cells
        if (getTableAt(x, y)) return;
        setDragStart({ x, y });
        setDragEnd({ x, y });
    };

    // Handle cell mouse enter during drag
    const handleCellMouseEnter = (x: number, y: number) => {
        if (!mergeMode || !dragStart) return;
        setDragEnd({ x, y });
    };

    // Handle mouse up to complete selection
    const handleMouseUp = () => {
        if (!mergeMode || !dragStart || !dragEnd) return;

        const minX = Math.min(dragStart.x, dragEnd.x);
        const maxX = Math.max(dragStart.x, dragEnd.x);
        const minY = Math.min(dragStart.y, dragEnd.y);
        const maxY = Math.max(dragStart.y, dragEnd.y);

        // Check if any cell in selection has existing table
        let hasConflict = false;
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                if (getTableAt(x, y)) {
                    hasConflict = true;
                    break;
                }
            }
            if (hasConflict) break;
        }

        if (hasConflict) {
            alert("Tidak dapat merge: Ada meja yang sudah ada di area tersebut");
            setDragStart(null);
            setDragEnd(null);
            return;
        }

        const spanX = maxX - minX + 1;
        const spanY = maxY - minY + 1;

        if (spanX > 1 || spanY > 1) {
            // Call with merge data
            onSlotClick(minX, minY, undefined, spanX, spanY);
        }

        // Reset selection
        setDragStart(null);
        setDragEnd(null);
    };

    // Toggle merge mode
    const toggleMergeMode = () => {
        setMergeMode(!mergeMode);
        setDragStart(null);
        setDragEnd(null);
    };

    const renderGrid = () => {
        const grid = [];
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                // Skip cells that are part of a merged table (not origin)
                if (shouldSkipCell(x, y)) {
                    continue;
                }

                const table = getTableAt(x, y);
                const spanX = table?.span_x || 1;
                const spanY = table?.span_y || 1;
                const isSelected = isCellSelected(x, y);

                grid.push(
                    <div
                        key={`${x}-${y}`}
                        style={{
                            gridColumn: `span ${spanX}`,
                            gridRow: `span ${spanY}`
                        }}
                        onClick={() => !mergeMode && onSlotClick(x, y, table)}
                        onMouseDown={() => handleCellMouseDown(x, y)}
                        onMouseEnter={() => handleCellMouseEnter(x, y)}
                        className={`
              rounded-lg border-2 flex flex-col items-center justify-center transition-all relative group
              ${(spanX === 1 && spanY === 1) ? 'aspect-square' : 'h-full'}
              ${mergeMode
                                ? isSelected
                                    ? "bg-blue-100 border-blue-500 dark:bg-blue-900/40 dark:border-blue-400"
                                    : "border-dashed border-gray-400 bg-gray-100 cursor-crosshair dark:border-gray-600 dark:bg-gray-800"
                                : table
                                    ? "bg-brand-100 border-brand-500 text-brand-700 dark:bg-brand-900/40 dark:border-brand-400 dark:text-brand-300 hover:shadow-md hover:scale-[1.02] cursor-pointer"
                                    : "border-dashed border-gray-300 bg-gray-50 text-gray-400 hover:border-gray-400 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-800 cursor-pointer"
                            }
            `}
                    >
                        {table ? (
                            <>
                                <span className="font-bold text-lg">{table.table_number}</span>
                                <div className="flex items-center gap-1 text-xs opacity-75">
                                    <span>{table.capacity}p</span>
                                </div>
                                {(spanX > 1 || spanY > 1) && (
                                    <div className="absolute bottom-1 left-1 text-[10px] bg-brand-600 text-white px-1.5 py-0.5 rounded">
                                        {spanX}x{spanY}
                                    </div>
                                )}
                                {/* Status Indicator */}
                                <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${table.status === 'available' ? 'bg-green-500' : 'bg-gray-400'
                                    }`} />
                            </>
                        ) : (
                            !mergeMode && <Plus className="w-5 h-5 opacity-0 group-hover:opacity-50 transition-opacity" />
                        )}
                    </div>
                );
            }
        }
        return grid;
    };

    return (
        <div className="p-6 border rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800" onMouseUp={handleMouseUp}>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Denah Lantai {floor}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {mergeMode
                            ? "Drag untuk memilih area yang akan di-merge"
                            : "Klik grid kosong untuk menempatkan meja"}
                    </p>
                </div>

                {/* Merge Mode Toggle */}
                <div className="flex items-center gap-3">
                    <Button
                        size="sm"
                        variant={mergeMode ? "primary" : "outline"}
                        onClick={toggleMergeMode}
                    >
                        {mergeMode ? <Square className="w-4 h-4 mr-2" /> : <Grid3x3 className="w-4 h-4 mr-2" />}
                        {mergeMode ? "Keluar Merge Mode" : "Merge Mode"}
                    </Button>

                    {/* Legend */}
                    <div className="flex gap-4 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span>Tersedia</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                            <span>Tidak Aktif</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-8 gap-3 max-w-5xl mx-auto select-none">
                {renderGrid()}
            </div>

            {mergeMode && dragStart && dragEnd && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                    💡 <strong>Tip:</strong> Setelah merge, Anda bisa menempatkan meja berkapasitas besar di area yang telah di-merge.
                    Area terpilih: {Math.abs(dragEnd.x - dragStart.x) + 1}x{Math.abs(dragEnd.y - dragStart.y) + 1}
                </div>
            )}
        </div>
    );
}
