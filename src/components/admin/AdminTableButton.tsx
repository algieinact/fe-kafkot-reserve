import React from 'react';
import { Table, TablePosition } from '../../types';
import { Edit, Trash2, Plus } from 'lucide-react';

interface AdminTableButtonProps {
  position: TablePosition;
  table?: Table; // Table data if this position has been assigned
  availableNumbers: string[]; // List of unassigned table numbers
  onAssign: (position: TablePosition, tableNumber: string) => void;
  onEdit: (table: Table) => void;
  onDelete: (table: Table) => void;
  canvasWidth: number;
  canvasHeight: number;
}

const AdminTableButton: React.FC<AdminTableButtonProps> = ({
  position,
  table,
  availableNumbers,
  onAssign,
  onEdit,
  onDelete,
  canvasWidth,
  canvasHeight,
}) => {
  const [showDropdown, setShowDropdown] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Convert pixel positions to percentages for responsive layout
  const leftPercent = (position.x / canvasWidth) * 100;
  const topPercent = (position.y / canvasHeight) * 100;
  const widthPercent = (position.width / canvasWidth) * 100;
  const heightPercent = (position.height / canvasHeight) * 100;

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  const handleAssignClick = (tableNumber: string) => {
    onAssign(position, tableNumber);
    setShowDropdown(false);
  };

  const handleMainClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!table) {
      setShowDropdown(!showDropdown);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (table) onEdit(table);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (table) onDelete(table);
  };

  return (
    <div
      className="absolute"
      style={{
        left: `${leftPercent}%`,
        top: `${topPercent}%`,
        width: `${widthPercent}%`,
        height: `${heightPercent}%`,
      }}
      ref={dropdownRef}
    >
      {/* Main Button */}
      <button
        onClick={handleMainClick}
        className={`
          w-full h-full border-3 rounded-lg transition-all duration-200
          flex flex-col items-center justify-center relative
          ${table
            ? 'bg-blue-100 border-blue-400 hover:bg-blue-200 dark:bg-blue-900/30 dark:border-blue-600'
            : 'bg-gray-100 border-gray-300 border-dashed hover:bg-gray-200 dark:bg-gray-800 dark:border-gray-600'
          }
        `}
      >
        {table ? (
          <>
            {/* Assigned Table */}
            <span className="font-bold text-sm md:text-base text-gray-900 dark:text-white">
              {table.table_number}
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {table.capacity} orang
            </span>
            
            {/* Action Buttons */}
            <div className="absolute top-1 right-1 flex gap-1">
              <button
                onClick={handleEdit}
                className="p-1 bg-white dark:bg-gray-700 rounded hover:bg-blue-50 dark:hover:bg-blue-900/50"
                title="Edit"
              >
                <Edit className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              </button>
              <button
                onClick={handleDelete}
                className="p-1 bg-white dark:bg-gray-700 rounded hover:bg-red-50 dark:hover:bg-red-900/50"
                title="Hapus"
              >
                <Trash2 className="w-3 h-3 text-red-600 dark:text-red-400" />
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Empty Slot */}
            <Plus className="w-4 h-4 md:w-6 md:h-6 text-gray-400 dark:text-gray-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Tambah
            </span>
          </>
        )}
      </button>

      {/* Dropdown for unassigned tables */}
      {!table && showDropdown && availableNumbers.length > 0 && (
        <div className="absolute top-full left-0 mt-1 w-full min-w-[120px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
          <div className="p-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 px-2">
              Pilih nomor meja:
            </p>
            {availableNumbers.map((number) => (
              <button
                key={number}
                onClick={() => handleAssignClick(number)}
                className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
              >
                {number}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No available numbers message */}
      {!table && showDropdown && availableNumbers.length === 0 && (
        <div className="absolute top-full left-0 mt-1 w-full min-w-[120px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Semua nomor meja sudah terpakai
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminTableButton;
