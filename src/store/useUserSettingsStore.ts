
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import LoggingService from '@/services/LoggingService';

interface FilterSettings {
  expanded: boolean;
}

interface TableSettings {
  columnVisibility: Record<string, Record<string, boolean>>;
}

interface UserSettings {
  filters: FilterSettings;
  tables: TableSettings;
  loggingEnabled: boolean;
  theme: 'light' | 'dark' | 'system';
}

interface UserSettingsState {
  settings: UserSettings;
  isLoading: boolean;
  setFilterExpanded: (expanded: boolean) => void;
  setColumnVisibility: (tableId: string, columnId: string, visible: boolean) => void;
  setLoggingEnabled: (enabled: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  saveSettings: () => Promise<void>;
}

const DEFAULT_SETTINGS: UserSettings = {
  filters: {
    expanded: false,
  },
  tables: {
    columnVisibility: {},
  },
  loggingEnabled: true,
  theme: 'system',
};

const useUserSettingsStore = create<UserSettingsState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      isLoading: false,
      
      setFilterExpanded: (expanded) => {
        set((state) => ({
          settings: {
            ...state.settings,
            filters: {
              ...state.settings.filters,
              expanded,
            },
          },
        }));
        
        LoggingService.logUserAction(
          'settings',
          'update_filter_expanded',
          `Filter expanded set to: ${expanded}`,
        );
        
        get().saveSettings();
      },
      
      setColumnVisibility: (tableId, columnId, visible) => {
        set((state) => {
          const currentTableSettings = state.settings.tables.columnVisibility[tableId] || {};
          
          return {
            settings: {
              ...state.settings,
              tables: {
                ...state.settings.tables,
                columnVisibility: {
                  ...state.settings.tables.columnVisibility,
                  [tableId]: {
                    ...currentTableSettings,
                    [columnId]: visible,
                  },
                },
              },
            },
          };
        });
        
        LoggingService.logUserAction(
          'settings',
          'update_column_visibility',
          `Column visibility updated: ${tableId}.${columnId} = ${visible}`,
        );
        
        get().saveSettings();
      },
      
      setLoggingEnabled: (enabled) => {
        set((state) => ({
          settings: {
            ...state.settings,
            loggingEnabled: enabled,
          },
        }));
        
        // Apply the setting immediately to the logging service
        LoggingService.setActivityTracking(enabled);
        
        // Log the action itself if logging is still enabled
        if (enabled) {
          LoggingService.logUserAction(
            'settings',
            'update_logging_enabled',
            `Logging enabled set to: ${enabled}`,
          );
        }
        
        get().saveSettings();
      },
      
      setTheme: (theme) => {
        set((state) => ({
          settings: {
            ...state.settings,
            theme,
          },
        }));
        
        LoggingService.logUserAction(
          'settings',
          'update_theme',
          `Theme set to: ${theme}`,
        );
        
        get().saveSettings();
      },
      
      saveSettings: async () => {
        try {
          // In a real implementation, you would call your API here
          // await UserService.updateSettings(get().settings);
          console.log('Settings saved to API', get().settings);
        } catch (error) {
          console.error('Failed to save settings to API:', error);
          // Consider adding toast notification here
        }
      },
    }),
    {
      name: 'user-settings-storage',
      // Only store the settings object in localStorage
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);

export default useUserSettingsStore;
