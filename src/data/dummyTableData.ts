import { Table, TableTypeDetail, AreaType } from '../types';

/**
 * Dummy Table Data for Testing
 * 
 * This file provides mock data for table availability until backend is ready.
 * It simulates the API response with realistic table data.
 */

// Mock table type data
const mockTableTypes: Record<number, TableTypeDetail> = {
  1: { id: 1, type_name: 'Indoor', description: 'Indoor seating area' },
  2: { id: 2, type_name: 'Semi-Outdoor', description: 'Semi-outdoor seating area' },
  3: { id: 3, type_name: 'Outdoor', description: 'Outdoor garden seating' },
};

// Mapping of table numbers to their properties
interface TableMapping {
  tableNumber: string;
  capacity: number;
  tableTypeId: number;
  area: AreaType;
}

const tableMapping: TableMapping[] = [
  // Indoor tables
  { tableNumber: 'A1', capacity: 2, tableTypeId: 1, area: 'indoor' },
  { tableNumber: 'A2', capacity: 2, tableTypeId: 1, area: 'indoor' },
  { tableNumber: 'A3', capacity: 2, tableTypeId: 1, area: 'indoor' },
  { tableNumber: 'A4', capacity: 2, tableTypeId: 1, area: 'indoor' },
  { tableNumber: 'B1', capacity: 4, tableTypeId: 1, area: 'indoor' },
  { tableNumber: 'B2', capacity: 4, tableTypeId: 1, area: 'indoor' },
  { tableNumber: 'B3', capacity: 4, tableTypeId: 1, area: 'indoor' },
  { tableNumber: 'C1', capacity: 6, tableTypeId: 1, area: 'indoor' },
  { tableNumber: 'C2', capacity: 6, tableTypeId: 1, area: 'indoor' },
  { tableNumber: 'D1', capacity: 8, tableTypeId: 1, area: 'indoor' },
  
  // Semi-Outdoor tables
  { tableNumber: 'S1', capacity: 2, tableTypeId: 2, area: 'semi_outdoor' },
  { tableNumber: 'S2', capacity: 2, tableTypeId: 2, area: 'semi_outdoor' },
  { tableNumber: 'S3', capacity: 2, tableTypeId: 2, area: 'semi_outdoor' },
  { tableNumber: 'S4', capacity: 4, tableTypeId: 2, area: 'semi_outdoor' },
  { tableNumber: 'S5', capacity: 4, tableTypeId: 2, area: 'semi_outdoor' },
  { tableNumber: 'S6', capacity: 4, tableTypeId: 2, area: 'semi_outdoor' },
  { tableNumber: 'S7', capacity: 6, tableTypeId: 2, area: 'semi_outdoor' },
  { tableNumber: 'S8', capacity: 6, tableTypeId: 2, area: 'semi_outdoor' },
  { tableNumber: 'S9', capacity: 6, tableTypeId: 2, area: 'semi_outdoor' },
  
  // Outdoor tables
  { tableNumber: 'O1', capacity: 4, tableTypeId: 3, area: 'outdoor' },
  { tableNumber: 'O2', capacity: 4, tableTypeId: 3, area: 'outdoor' },
  { tableNumber: 'O3', capacity: 4, tableTypeId: 3, area: 'outdoor' },
  { tableNumber: 'O4', capacity: 4, tableTypeId: 3, area: 'outdoor' },
  { tableNumber: 'O5', capacity: 6, tableTypeId: 3, area: 'outdoor' },
  { tableNumber: 'O6', capacity: 4, tableTypeId: 3, area: 'outdoor' },
  { tableNumber: 'O7', capacity: 4, tableTypeId: 3, area: 'outdoor' },
  { tableNumber: 'O8', capacity: 6, tableTypeId: 3, area: 'outdoor' },
  { tableNumber: 'O9', capacity: 4, tableTypeId: 3, area: 'outdoor' },
];

/**
 * Generate dummy available tables based on table type
 * Simulates some tables being unavailable randomly
 */
export const getDummyAvailableTables = (
  tableTypeId: number,
  _date?: string,
  _time?: string
): Table[] => {
  // Filter tables by table type
  const tablesForType = tableMapping.filter(t => t.tableTypeId === tableTypeId);
  
  // Randomly mark some tables as unavailable (30% chance)
  const unavailableIndices = new Set<number>();
  const unavailableCount = Math.floor(tablesForType.length * 0.3);
  
  while (unavailableIndices.size < unavailableCount) {
    const randomIndex = Math.floor(Math.random() * tablesForType.length);
    unavailableIndices.add(randomIndex);
  }
  
  // Create table objects
  return tablesForType.map((mapping, index) => ({
    id: index + 1 + (tableTypeId * 100), // Generate unique ID
    table_number: mapping.tableNumber,
    table_type: mockTableTypes[tableTypeId],
    capacity: mapping.capacity,
    status: unavailableIndices.has(index) ? 'reserved' : 'available',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as Table));
};

/**
 * Get all tables for a specific area
 */
export const getTablesForArea = (area: AreaType): Table[] => {
  const tablesForArea = tableMapping.filter(t => t.area === area);
  
  // Randomly mark some tables as unavailable
  const unavailableIndices = new Set<number>();
  const unavailableCount = Math.floor(tablesForArea.length * 0.3);
  
  while (unavailableIndices.size < unavailableCount) {
    const randomIndex = Math.floor(Math.random() * tablesForArea.length);
    unavailableIndices.add(randomIndex);
  }
  
  return tablesForArea.map((mapping, index) => ({
    id: index + 1 + (mapping.tableTypeId * 100),
    table_number: mapping.tableNumber,
    table_type: mockTableTypes[mapping.tableTypeId],
    capacity: mapping.capacity,
    status: unavailableIndices.has(index) ? 'reserved' : 'available',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as Table));
};

/**
 * Get table by table number
 */
export const getTableByNumber = (tableNumber: string): Table | null => {
  const mapping = tableMapping.find(t => t.tableNumber === tableNumber);
  if (!mapping) return null;
  
  return {
    id: tableMapping.indexOf(mapping) + 1,
    table_number: mapping.tableNumber,
    table_type: mockTableTypes[mapping.tableTypeId],
    capacity: mapping.capacity,
    status: 'available',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

/**
 * Simulate API delay
 */
export const simulateApiDelay = (ms: number = 500): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
