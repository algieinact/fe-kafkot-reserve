import React, { useState, useMemo, useEffect } from 'react';
import { Table, TableTypeDetail } from '../../types';

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

    const getTableAt = (x: number, y: number) => {
        return floorTables.find(t => Number(t.position_x) === x && Number(t.position_y) === y);
    };

    const renderGrid = () => {
        const grid = [];
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                const table = getTableAt(x, y);
                // Type assertion for is_available_for_booking because it might not be in Table interface yet (it comes from backend availability check)
                const isAvailable = (table as any)?.is_available_for_booking;
                const isSelected = table?.id === selectedTableId;

                grid.push(
                    <div
                        key={`${x}-${y}`}
                        onClick={() => table && isAvailable && onTableSelect(table.id)}
                        className={`
                            aspect-square rounded-lg border-2 flex flex-col items-center justify-center transition-all relative
                            ${table
                                ? isSelected
                                    ? "bg-blue-500 border-blue-600 text-white shadow-lg scale-105 cursor-pointer z-10"
                                    : isAvailable
                                        ? "bg-emerald-100 border-emerald-400 text-emerald-900 hover:bg-emerald-200 cursor-pointer hover:shadow-md z-10"
                                        : "bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed z-10"
                                : "invisible border-0"
                            }
                        `}
                    >
                        {table && (
                            <>
                                <span className="font-bold text-lg">{table.table_number}</span>
                                <span className="text-xs">{table.capacity} Org</span>
                                {isSelected && (
                                    <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full animate-pulse" />
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
            {/* Info Legend */}
            <div className="flex flex-wrap gap-4 text-sm justify-between bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-emerald-100 border-2 border-emerald-400 rounded"></div>
                        <span className="text-gray-600 dark:text-gray-300">Tersedia</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-500 border-2 border-blue-600 rounded"></div>
                        <span className="text-gray-600 dark:text-gray-300">Dipilih</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-200 border-2 border-gray-300 rounded"></div>
                        <span className="text-gray-600 dark:text-gray-300">Tidak Tersedia</span>
                    </div>
                </div>
            </div>

            {/* Controls: Floor & Type Filter */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center border-b border-gray-200 dark:border-gray-700 pb-4">
                {/* Floor Selector */}
                <div className="flex gap-2 overflow-x-auto">
                    {[1, 2, 3].map(floor => (
                        <button
                            key={floor}
                            onClick={() => setSelectedFloor(floor)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${selectedFloor === floor
                                ? 'bg-brand-600 text-white shadow-md'
                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
                                }`}
                        >
                            Lantai {floor}
                        </button>
                    ))}
                </div>

                {/* Table Type Filter */}
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</span>
                    <select
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        value={selectedTypeId || ""}
                        onChange={(e) => {
                            const val = e.target.value;
                            setSelectedTypeId(val ? Number(val) : null);
                        }}
                    >
                        <option value="">Semua Tipe</option>
                        {tableTypes.map(type => (
                            <option key={type.id} value={type.id}>{type.type_name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-8 gap-2 sm:gap-3 max-w-full mx-auto p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-inner overflow-x-auto min-w-[300px]">
                {renderGrid()}
            </div>

        </div>
    );
};

export default DynamicTableLayout;
