import { TableLayoutConfig, AreaType } from '../types';

/**
 * Table Layout Configuration for Cafe Areas
 * 
 * This configuration defines the visual layout of tables in each cafe area.
 * Each table position is mapped to a physical table number from the backend.
 * 
 * Coordinate System:
 * - Origin (0,0) is at top-left corner
 * - X increases to the right
 * - Y increases downward
 * - All measurements in pixels (will be converted to percentage for responsive display)
 * 
 * Canvas Size: 800x600 (reference dimensions)
 */

// Indoor Area Layout
export const indoorLayout: TableLayoutConfig = {
  areaId: 'indoor',
  areaName: 'Indoor',
  width: 800,
  height: 600,
  tables: [
    // Top row - small tables (2 person capacity)
    { tableNumber: 'A1', x: 50, y: 50, width: 80, height: 80, shape: 'square' },
    { tableNumber: 'A2', x: 150, y: 50, width: 80, height: 80, shape: 'square' },
    { tableNumber: 'A3', x: 250, y: 50, width: 80, height: 80, shape: 'square' },
    { tableNumber: 'A4', x: 350, y: 50, width: 80, height: 80, shape: 'square' },
    
    // Middle row - medium tables (4 person capacity)
    { tableNumber: 'B1', x: 50, y: 200, width: 120, height: 80, shape: 'rectangle' },
    { tableNumber: 'B2', x: 200, y: 200, width: 120, height: 80, shape: 'rectangle' },
    { tableNumber: 'B3', x: 350, y: 200, width: 120, height: 80, shape: 'rectangle' },
    
    // Bottom row - large tables (6 person capacity)
    { tableNumber: 'C1', x: 50, y: 350, width: 140, height: 100, shape: 'rectangle' },
    { tableNumber: 'C2', x: 220, y: 350, width: 140, height: 100, shape: 'rectangle' },
    
    // Corner table - extra large (8 person capacity)
    { tableNumber: 'D1', x: 500, y: 200, width: 160, height: 120, shape: 'rectangle' },
  ],
};

// Semi-Outdoor Area Layout
export const semiOutdoorLayout: TableLayoutConfig = {
  areaId: 'semi_outdoor',
  areaName: 'Semi-Outdoor',
  width: 800,
  height: 600,
  tables: [
    // Left side - small tables
    { tableNumber: 'S1', x: 50, y: 50, width: 80, height: 80, shape: 'square' },
    { tableNumber: 'S2', x: 50, y: 160, width: 80, height: 80, shape: 'square' },
    { tableNumber: 'S3', x: 50, y: 270, width: 80, height: 80, shape: 'square' },
    
    // Center - medium tables
    { tableNumber: 'S4', x: 200, y: 100, width: 120, height: 80, shape: 'rectangle' },
    { tableNumber: 'S5', x: 200, y: 220, width: 120, height: 80, shape: 'rectangle' },
    { tableNumber: 'S6', x: 200, y: 340, width: 120, height: 80, shape: 'rectangle' },
    
    // Right side - large tables
    { tableNumber: 'S7', x: 400, y: 80, width: 140, height: 100, shape: 'rectangle' },
    { tableNumber: 'S8', x: 400, y: 220, width: 140, height: 100, shape: 'rectangle' },
    { tableNumber: 'S9', x: 400, y: 360, width: 140, height: 100, shape: 'rectangle' },
  ],
};

// Outdoor Area Layout
export const outdoorLayout: TableLayoutConfig = {
  areaId: 'outdoor',
  areaName: 'Outdoor',
  width: 800,
  height: 600,
  tables: [
    // Garden style layout - scattered arrangement
    { tableNumber: 'O1', x: 80, y: 80, width: 100, height: 100, shape: 'square' },
    { tableNumber: 'O2', x: 250, y: 60, width: 120, height: 80, shape: 'rectangle' },
    { tableNumber: 'O3', x: 450, y: 80, width: 100, height: 100, shape: 'square' },
    
    { tableNumber: 'O4', x: 80, y: 250, width: 120, height: 80, shape: 'rectangle' },
    { tableNumber: 'O5', x: 280, y: 220, width: 140, height: 100, shape: 'rectangle' },
    { tableNumber: 'O6', x: 500, y: 250, width: 120, height: 80, shape: 'rectangle' },
    
    { tableNumber: 'O7', x: 80, y: 400, width: 100, height: 100, shape: 'square' },
    { tableNumber: 'O8', x: 250, y: 380, width: 140, height: 100, shape: 'rectangle' },
    { tableNumber: 'O9', x: 470, y: 400, width: 100, height: 100, shape: 'square' },
  ],
};

// Export all layouts as a map for easy access
export const tableLayouts: Record<AreaType, TableLayoutConfig> = {
  indoor: indoorLayout,
  semi_outdoor: semiOutdoorLayout,
  outdoor: outdoorLayout,
};

// Helper function to get layout by area
export const getLayoutByArea = (area: AreaType): TableLayoutConfig => {
  return tableLayouts[area];
};

// Helper function to find table position by table number
export const findTablePosition = (area: AreaType, tableNumber: string) => {
  const layout = getLayoutByArea(area);
  return layout?.tables.find(t => t.tableNumber === tableNumber);
};

// Helper function to get all table numbers for an area
export const getTableNumbersForArea = (area: AreaType): string[] => {
  const layout = getLayoutByArea(area);
  return layout.tables.map(t => t.tableNumber);
};
