import React, { useState, useMemo, useEffect } from 'react';
import { Table, TableTypeDetail } from '../../types';
import { User, ChevronDown } from 'lucide-react'; // Using icons for minimalist feel

interface DynamicTableLayoutProps {
    tables: Table[];
    selectedTableId: number | null;
    onTableSelect: (tableId: number) => void;
}

const DynamicTableLayout: React.FC<DynamicTableLayoutProps> = ({
    tables,
    selectedTableId,
    onTableSelect,
}) => {
    const [selectedFloor, setSelectedFloor] = useState(1);
    const [tableTypes, setTableTypes] = useState<TableTypeDetail[]>([]);
    const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);

    // Fetch table types on mount
    useEffect(() => {
        const fetchTableTypes = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
                const response = await fetch(`${apiUrl}/table-types`);
                const data = await response.json();
                if (data.success) {
                    setTableTypes(data.data);
                }
            } catch (error) {
                console.error("Error fetching table types:", error);
            }
        };

        fetchTableTypes();
    }, []);

    // Grid Configuration (Must match Admin Layout)
    const ROWS = 6;
    const COLS = 8;

    // Filter tables by floor and type
    const { floorTables } = useMemo(() => {
        const floor = tables.filter(t => {
            // Filter by floor
            if (t.floor !== selectedFloor) return false;

            // Filter by position existence
            if (t.position_x === -1 || t.position_x === null || t.position_x === undefined) return false;

            // Filter by table type (if selected)
            if (selectedTypeId !== null && t.table_type?.id !== selectedTypeId) return false;

            return true;
        });
        return { floorTables: floor };
    }, [tables, selectedFloor, selectedTypeId]);

    // Helper to find table at specific coordinate considering span
    const getTableAt = (x: number, y: number) => {
        return floorTables.find(t => {
            const spanX = t.span_x || 1;
            const spanY = t.span_y || 1;
            return x >= Number(t.position_x) && x < Number(t.position_x) + spanX &&
                y >= Number(t.position_y) && y < Number(t.position_y) + spanY;
        });
    };

    // Check if a cell should be skipped (it's part of a merged table)
    const shouldSkipCell = (x: number, y: number) => {
        const table = getTableAt(x, y);
        if (!table) return false;
        // If this is not the origin cell of the table, skip it
        return !(Number(table.position_x) === x && Number(table.position_y) === y);
    };

    const renderGrid = () => {
        const grid = [];
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                // Skip rendering if this cell is part of a merge but not the top-left
                if (shouldSkipCell(x, y)) {
                    continue;
                }

                const table = getTableAt(x, y);
                // Type assertion for is_available_for_booking
                const isAvailable = (table as any)?.is_available_for_booking;
                const isSelected = table?.id === selectedTableId;

                const spanX = table?.span_x || 1;
                const spanY = table?.span_y || 1;
                const isMerged = spanX > 1 || spanY > 1;

                grid.push(
                    <div
                        key={`${x}-${y}`}
                        style={{
                            gridColumn: `span ${spanX}`,
                            gridRow: `span ${spanY}`
                        }}
                        onClick={() => table && isAvailable && onTableSelect(table.id)}
                        className={`
                            relative flex flex-col items-center justify-center transition-all duration-200
                            ${!isMerged ? 'aspect-square' : 'min-h-full'} 
                            rounded-xl
                            ${table
                                ? isSelected
                                    ? "bg-gray-900 border-2 border-gray-900 text-white shadow-lg scale-105 z-20"
                                    : isAvailable
                                        ? "bg-white border text-gray-800 hover:border-gray-400 hover:shadow-md cursor-pointer z-10 border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:border-gray-500"
                                        : "bg-gray-50 border border-gray-100 text-gray-300 cursor-not-allowed dark:bg-gray-900/50 dark:border-gray-800 dark:text-gray-700"
                                : "invisible" // Empty slots invisible
                            }
                        `}
                    >
                        {table && (
                            <>
                                <span className={`font-semibold ${isMerged ? 'text-lg' : 'text-base'}`}>{table.table_number}</span>

                                <div className="flex items-center gap-1 mt-1">
                                    <User size={12} className={isSelected ? 'text-gray-300' : 'text-gray-400'} />
                                    <span className={`text-xs ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>{table.capacity}</span>
                                </div>

                                {/* Status Indicator Dot */}
                                {!isSelected && (
                                    <div className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-gray-300'
                                        }`} />
                                )}
                            </>
                        )}
                    </div>
                );
            }
        }
        return grid;
    };

    return (
        <div className="space-y-6">
            {/* Info Legend - Clean Minimalist */}
            <div className="flex flex-wrap gap-6 text-sm justify-center py-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                    <span className="text-gray-500">Tersedia</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-900 dark:bg-white"></div>
                    <span className="text-gray-500">Dipilih</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                    <span className="text-gray-500">Tidak Tersedia</span>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pb-2">
                {/* Floor Selector - Tab Style */}
                <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    {[1, 2, 3].map(floor => (
                        <button
                            key={floor}
                            onClick={() => setSelectedFloor(floor)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${selectedFloor === floor
                                ? 'bg-white shadow-sm text-gray-900 dark:bg-gray-700 dark:text-white'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                        >
                            Lantai {floor}
                        </button>
                    ))}
                </div>

                {/* Table Type Filter - Minimalist Input */}
                <div className="relative flex items-center">
                    <select
                        className="appearance-none pl-3 pr-8 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:border-gray-400 dark:focus:border-gray-600 focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none text-gray-700 dark:text-gray-300 cursor-pointer hover:border-gray-400 dark:hover:border-gray-600 transition-colors shadow-sm"
                        value={selectedTypeId || ""}
                        onChange={(e) => {
                            const val = e.target.value;
                            setSelectedTypeId(val ? Number(val) : null);
                        }}
                    >
                        <option value="">Semua Tipe Meja</option>
                        {tableTypes.map(type => (
                            <option key={type.id} value={type.id}>{type.type_name}</option>
                        ))}
                    </select>
                    <div className="absolute right-2 pointer-events-none text-gray-400">
                        <ChevronDown size={16} />
                    </div>
                </div>
            </div>

            {/* Grid Layout - Minimalist Container */}
            <div className="grid grid-cols-8 gap-3 max-w-full mx-auto p-6 bg-white dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 overflow-x-auto min-w-[300px]">
                {renderGrid()}
            </div>

            <p className="text-center text-xs text-gray-400 mt-2">
                * Klik meja yang tersedia (putih) untuk memilih
            </p>
        </div>
    );
};

export default DynamicTableLayout;
