import React from 'react';
import { AreaType } from '../../types';

interface AreaTabsProps {
  activeArea: AreaType;
  onAreaChange: (area: AreaType) => void;
  availableCounts?: Record<AreaType, number>;
}

const AreaTabs: React.FC<AreaTabsProps> = ({
  activeArea,
  onAreaChange,
  availableCounts,
}) => {
  const areas: { id: AreaType; label: string }[] = [
    { id: 'indoor', label: 'Indoor' },
    { id: 'semi_outdoor', label: 'Semi-Outdoor' },
    { id: 'outdoor', label: 'Outdoor' },
  ];

  return (
    <div className="flex gap-2 mb-4 border-b border-gray-200 dark:border-gray-700">
      {areas.map((area) => (
        <button
          key={area.id}
          onClick={() => onAreaChange(area.id)}
          className={`
            px-4 py-2 font-medium text-sm transition-all duration-200
            border-b-2 relative
            ${
              activeArea === area.id
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }
          `}
        >
          {area.label}
          {availableCounts && availableCounts[area.id] !== undefined && (
            <span
              className={`
                ml-2 px-2 py-0.5 rounded-full text-xs
                ${
                  activeArea === area.id
                    ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }
              `}
            >
              {availableCounts[area.id]}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default AreaTabs;
