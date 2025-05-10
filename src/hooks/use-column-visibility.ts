
import { useState, useEffect } from 'react';
import useUserSettingsStore from '@/store/useUserSettingsStore';

export type ColumnVisibility = Record<string, boolean>;

export interface UseColumnVisibilityProps {
  tableId: string;
  defaultVisibility?: ColumnVisibility;
  columns: { id?: string; accessorKey: string; header: string }[];
}

export const useColumnVisibility = ({
  tableId,
  defaultVisibility = {},
  columns,
}: UseColumnVisibilityProps) => {
  // Get settings from store
  const { settings, setColumnVisibility: updateSettings } = useUserSettingsStore();

  // Initialize visibility state from settings or defaults
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>(() => {
    const savedVisibility = settings.tables.columnVisibility[tableId] || {};
    const initialVisibility: ColumnVisibility = {};
    
    // For each column, check if we have a saved setting, otherwise use default or true
    columns.forEach((column) => {
      const columnId = column.id || column.accessorKey;
      initialVisibility[columnId] = 
        savedVisibility[columnId] !== undefined 
          ? savedVisibility[columnId] 
          : (defaultVisibility[columnId] !== undefined ? defaultVisibility[columnId] : true);
    });
    
    return initialVisibility;
  });

  // Save column visibility changes to store
  const toggleColumnVisibility = (columnId: string, visible?: boolean) => {
    const newVisibility = visible !== undefined 
      ? { ...columnVisibility, [columnId]: visible }
      : { ...columnVisibility, [columnId]: !columnVisibility[columnId] };
    
    setColumnVisibility(newVisibility);
    
    // Update the store
    updateSettings(tableId, columnId, newVisibility[columnId]);
  };

  // Filter columns based on visibility
  const visibleColumns = columns.filter((column) => {
    const columnId = column.id || column.accessorKey;
    return columnVisibility[columnId] !== false;
  });

  return {
    columnVisibility,
    visibleColumns,
    toggleColumnVisibility,
    setColumnVisibility,
  };
};
