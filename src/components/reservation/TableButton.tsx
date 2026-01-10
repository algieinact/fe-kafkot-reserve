import React from 'react';
import { Table, TablePosition } from '../../types';
import { Users } from 'lucide-react';

interface TableButtonProps {
  table: Table;
  position: TablePosition;
  isSelected: boolean;
  isAvailable: boolean;
  onSelect: (tableId: number) => void;
  canvasWidth: number;
  canvasHeight: number;
}

const TableButton: React.FC<TableButtonProps> = ({
  table,
  position,
  isSelected,
  isAvailable,
  onSelect,
  canvasWidth,
  canvasHeight,
}) => {
  // Convert pixel positions to percentages for responsive layout
  const leftPercent = (position.x / canvasWidth) * 100;
  const topPercent = (position.y / canvasHeight) * 100;
  const widthPercent = (position.width / canvasWidth) * 100;
  const heightPercent = (position.height / canvasHeight) * 100;

  // Determine visual state
  const getStatusClasses = () => {
    if (!isAvailable) {
      return 'bg-gray-300 border-gray-400 cursor-not-allowed text-gray-600';
    }
    if (isSelected) {
      return 'bg-blue-500 border-blue-600 text-white shadow-lg ring-2 ring-blue-400';
    }
    return 'bg-emerald-100 border-emerald-400 hover:bg-emerald-200 hover:shadow-md text-gray-800';
  };

  // Determine border radius based on shape
  const getShapeClasses = () => {
    return position.shape === 'square' ? 'rounded-lg' : 'rounded-lg';
  };

  const handleClick = () => {
    if (isAvailable) {
      onSelect(table.id);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!isAvailable}
      className={`
        absolute border-3 transition-all duration-200 
        flex flex-col items-center justify-center
        ${getStatusClasses()} 
        ${getShapeClasses()}
        ${isAvailable ? 'hover:scale-105' : ''}
      `}
      style={{
        left: `${leftPercent}%`,
        top: `${topPercent}%`,
        width: `${widthPercent}%`,
        height: `${heightPercent}%`,
      }}
      aria-label={`Meja ${table.table_number}, kapasitas ${table.capacity} orang, ${isAvailable ? 'tersedia' : 'tidak tersedia'}`}
      aria-pressed={isSelected}
    >
      {/* Table Number */}
      <span className="font-bold text-xs sm:text-sm md:text-base">
        {table.table_number}
      </span>
      
      {/* Capacity */}
      <div className="flex items-center gap-1 mt-1">
        <Users className="w-3 h-3 sm:w-4 sm:h-4" />
        <span className="text-xs sm:text-sm">{table.capacity}</span>
      </div>
    </button>
  );
};

export default TableButton;
