
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Columns } from 'lucide-react';
import { ColumnVisibility } from '@/hooks/use-column-visibility';

interface ColumnSelectorProps {
  columns: { id?: string; accessorKey: string; header: string }[];
  columnVisibility: ColumnVisibility;
  toggleColumnVisibility: (columnId: string, visible?: boolean) => void;
}

export function ColumnSelector({ 
  columns, 
  columnVisibility, 
  toggleColumnVisibility 
}: ColumnSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto">
          <Columns className="h-4 w-4 mr-2" />
          Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns.map((column) => {
          const columnId = column.id || column.accessorKey;
          // Skip showing "actions" column in the selector
          if (columnId === 'actions') return null;
          
          return (
            <DropdownMenuCheckboxItem
              key={columnId}
              checked={columnVisibility[columnId] !== false}
              onCheckedChange={(checked) => toggleColumnVisibility(columnId, checked)}
            >
              {column.header}
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
