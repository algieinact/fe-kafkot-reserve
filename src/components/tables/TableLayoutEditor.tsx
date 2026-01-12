import { Table } from "../../types";
import { Plus } from "lucide-react";

interface Props {
    floor: number;
    tables: Table[];
    onSlotClick: (x: number, y: number, currentTable?: Table) => void;
}

export default function TableLayoutEditor({ floor, tables, onSlotClick }: Props) {
    // Grid configuration: 8 Columns x 6 Rows
    const ROWS = 6;
    const COLS = 8;

    // Helper to find table at specific coordinate
    const getTableAt = (x: number, y: number) => {
        return tables.find(t => t.floor === floor && t.position_x === x && t.position_y === y);
    };

    const renderGrid = () => {
        const grid = [];
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                const table = getTableAt(x, y);
                grid.push(
                    <div
                        key={`${x}-${y}`}
                        onClick={() => onSlotClick(x, y, table)}
                        className={`
              aspect-square rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all relative group
              ${table
                                ? "bg-brand-100 border-brand-500 text-brand-700 dark:bg-brand-900/40 dark:border-brand-400 dark:text-brand-300 hover:shadow-md hover:scale-[1.02]"
                                : "border-dashed border-gray-300 bg-gray-50 text-gray-400 hover:border-gray-400 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-800"
                            }
            `}
                    >
                        {table ? (
                            <>
                                <span className="font-bold text-lg">{table.table_number}</span>
                                <div className="flex items-center gap-1 text-xs opacity-75">
                                    <span>{table.capacity}p</span>
                                </div>
                                {/* Status Indicator */}
                                <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${table.status === 'available' ? 'bg-green-500' :
                                        table.status === 'reserved' ? 'bg-yellow-500' : 'bg-red-500'
                                    }`} />
                            </>
                        ) : (
                            <Plus className="w-5 h-5 opacity-0 group-hover:opacity-50 transition-opacity" />
                        )}
                    </div>
                );
            }
        }
        return grid;
    };

    return (
        <div className="p-6 border rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Denah Lantai {floor}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Klik grid kosong untuk menempatkan meja</p>
                </div>

                {/* Legend */}
                <div className="flex gap-4 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span>Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span>Reserved</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span>Inactive</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-8 gap-3 max-w-5xl mx-auto">
                {renderGrid()}
            </div>
        </div>
    );
}
