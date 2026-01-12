import React from 'react';
import { Table, TableLayoutConfig, TablePosition } from '../../types';
import TableButton from './TableButton';

interface TableLayoutViewerProps {
  layout: TableLayoutConfig;
  tables: Table[];
  selectedTableId: number | null;
  onTableSelect: (tableId: number) => void;
}

const TableLayoutViewer: React.FC<TableLayoutViewerProps> = ({
  layout,
  tables,
  selectedTableId,
  onTableSelect,
}) => {
  // Calculate aspect ratio for responsive container
  const aspectRatio = (layout.height / layout.width) * 100;

  // Map table positions to actual table data
  const getTableWithPosition = (position: TablePosition) => {
    return tables.find(t => t.table_number === position.tableNumber);
  };

  // Count available tables - check is_available_for_booking if available
  const availableCount = tables.filter(t => {
    const isAvailable = (t as any).is_available_for_booking ?? (t.status === 'available');
    return isAvailable;
  }).length;
  const totalCount = layout.tables.length;

  console.log('TableLayoutViewer - Total tables:', tables.length, 'Available:', availableCount);

  return (
    <div className="space-y-4">
      {/* Info Bar */}
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>
          {availableCount} dari {totalCount} meja tersedia
        </span>
        <div className="flex items-center gap-4">
          {/* Legend */}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-100 border-2 border-emerald-400 rounded"></div>
            <span>Tersedia</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 border-2 border-blue-600 rounded"></div>
            <span>Dipilih</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-300 border-2 border-gray-400 rounded"></div>
            <span>Tidak Tersedia</span>
          </div>
        </div>
      </div>

      {/* Layout Canvas */}
      <div className="relative w-full overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700">
        {/* Aspect ratio container */}
        <div
          className="relative bg-gradient-to-br from-stone-100 to-stone-50 dark:from-gray-800 dark:to-gray-900"
          style={{ paddingBottom: `${aspectRatio}%` }}
        >
          {/* Absolute positioning wrapper */}
          <div className="absolute inset-0 p-2 md:p-4">
            {layout.tables.map((position) => {
              const table = getTableWithPosition(position);

              // Debug logging
              console.log('Position:', position.tableNumber, 'Table found:', table);

              // Skip if table not found in data
              if (!table) {
                console.warn(`Table ${position.tableNumber} not found in data`);
                return null;
              }

              const isSelected = selectedTableId === table.id;
              // Use is_available_for_booking from backend if available, fallback to status
              const isAvailable = (table as any).is_available_for_booking ?? (table.status === 'available');

              console.log(`Table ${table.table_number}: isAvailable=${isAvailable}, status=${table.status}`);

              return (
                <TableButton
                  key={table.id}
                  table={table}
                  position={position}
                  isSelected={isSelected}
                  isAvailable={isAvailable}
                  onSelect={onTableSelect}
                  canvasWidth={layout.width}
                  canvasHeight={layout.height}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* No tables available message */}
      {availableCount === 0 && (
        <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-4 text-center">
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Tidak ada meja tersedia di area {layout.areaName}
          </p>
          <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-300">
            Coba pilih area lain atau waktu berbeda
          </p>
        </div>
      )}
    </div>
  );
};

export default TableLayoutViewer;
