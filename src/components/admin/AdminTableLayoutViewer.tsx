import React from 'react';
import { Table, TableLayoutConfig } from '../../types';
import AdminTableButton from './AdminTableButton';

interface AdminTableLayoutViewerProps {
  layout: TableLayoutConfig;
  tables: Table[];
  onAssignTable: (position: any, tableNumber: string) => void;
  onEditTable: (table: Table) => void;
  onDeleteTable: (table: Table) => void;
}

const AdminTableLayoutViewer: React.FC<AdminTableLayoutViewerProps> = ({
  layout,
  tables,
  onAssignTable,
  onEditTable,
  onDeleteTable,
}) => {
  // Calculate aspect ratio for responsive container
  const aspectRatio = (layout.height / layout.width) * 100;

  // Get all table numbers from layout config
  const allLayoutNumbers = layout.tables.map(t => t.tableNumber);
  
  // Get assigned table numbers
  const assignedNumbers = tables.map(t => t.table_number);
  
  // Get available (unassigned) table numbers
  const availableNumbers = allLayoutNumbers.filter(num => !assignedNumbers.includes(num));

  // Find table data for a position
  const getTableForPosition = (position: any) => {
    return tables.find(t => t.table_number === position.tableNumber);
  };

  // Count statistics
  const assignedCount = tables.length;
  const totalCount = layout.tables.length;
  const availableCount = totalCount - assignedCount;

  return (
    <div className="space-y-4">
      {/* Info Bar */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <span className="text-gray-600 dark:text-gray-400">
            {assignedCount} dari {totalCount} meja sudah di-assign
          </span>
          <span className="text-emerald-600 dark:text-emerald-400">
            {availableCount} tersedia
          </span>
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border-2 border-blue-400 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Sudah di-assign</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 border-2 border-gray-300 border-dashed rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Belum di-assign</span>
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
              const table = getTableForPosition(position);

              return (
                <AdminTableButton
                  key={position.tableNumber}
                  position={position}
                  table={table}
                  availableNumbers={availableNumbers}
                  onAssign={onAssignTable}
                  onEdit={onEditTable}
                  onDelete={onDeleteTable}
                  canvasWidth={layout.width}
                  canvasHeight={layout.height}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          💡 <strong>Cara Penggunaan:</strong> Klik meja kosong untuk menambahkan nomor meja. 
          Klik meja yang sudah terisi untuk edit atau hapus.
        </p>
      </div>
    </div>
  );
};

export default AdminTableLayoutViewer;
