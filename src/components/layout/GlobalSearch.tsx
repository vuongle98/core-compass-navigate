import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import useDebounce from '@/hooks/use-debounce';
import { 
  Search, File, Users, Settings, Bell, Bot, Flag, 
  FileText, Calendar, Layers, Shield, Key, Database
} from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { Permission } from '@/types/Auth';
import EnhancedApiService from '@/services/EnhancedApiService';

type SearchResult = {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  url: string;
  type: string;
  permission?: string;
};

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial navigation items
  const navigationItems: SearchResult[] = [
    { id: 'dashboard', title: 'Dashboard', url: '/', type: 'navigation', icon: <Layers className="mr-2 h-4 w-4" /> },
    { id: 'users', title: 'Users', url: '/users', type: 'navigation', icon: <Users className="mr-2 h-4 w-4" />, permission: 'user:read' },
    { id: 'blogs', title: 'Blog Management', url: '/blogs', type: 'navigation', icon: <FileText className="mr-2 h-4 w-4" />, permission: 'blog:read' },
    { id: 'roles', title: 'Roles', url: '/roles', type: 'navigation', icon: <Shield className="mr-2 h-4 w-4" />, permission: 'role:read' },
    { id: 'permissions', title: 'Permissions', url: '/permissions', type: 'navigation', icon: <Key className="mr-2 h-4 w-4" />, permission: 'permission:manage' },
    { id: 'bots', title: 'Bots', url: '/bots', type: 'navigation', icon: <Bot className="mr-2 h-4 w-4" /> },
    { id: 'notifications', title: 'Notifications', url: '/notifications', type: 'navigation', icon: <Bell className="mr-2 h-4 w-4" /> },
    { id: 'files', title: 'Files', url: '/files', type: 'navigation', icon: <File className="mr-2 h-4 w-4" />, permission: 'files:manage' },
    { id: 'feature-flags', title: 'Feature Flags', url: '/feature-flags', type: 'navigation', icon: <Flag className="mr-2 h-4 w-4" />, permission: 'feature:flags' },
    { id: 'configuration', title: 'Configuration', url: '/configuration', type: 'navigation', icon: <Settings className="mr-2 h-4 w-4" />, permission: 'settings:read' },
  ];

  // Filter navigation items based on permissions
  const filteredNavigationItems = navigationItems.filter(item => {
    return !item.permission || hasPermission(item.permission);
  });

  // Effect to handle dialog open state and focus input
  useEffect(() => {
    if (open) {
      // Focus the input when the dialog opens
      setTimeout(() => inputRef.current?.focus(), 0);
      // Reset results to navigation items
      setResults(filteredNavigationItems);
    }
  }, [open, filteredNavigationItems]);

  // Effect to handle search query changes
  useEffect(() => {
    const search = async () => {
      if (!debouncedSearchQuery.trim()) {
        setResults(filteredNavigationItems);
        return;
      }

      setIsLoading(true);
      try {
        // Initially show filtered navigation items
        const filteredNavItems = filteredNavigationItems.filter(item =>
          item.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
        );

        // Only do API search if query is meaningful
        if (debouncedSearchQuery.length >= 3) {
          // Search API for content
          try {
            const response = await EnhancedApiService.post<{ results: SearchResult[] }>('/api/search', {
              query: debouncedSearchQuery,
              limit: 10
            });

            // Filter API results based on permissions
            const apiResults = response.results.filter(item => {
              return !item.permission || hasPermission(item.permission);
            });

            // Combine navigation items with API results, removing duplicates
            const combined = [...filteredNavItems];
            apiResults.forEach(apiItem => {
              if (!combined.some(item => item.id === apiItem.id)) {
                combined.push(apiItem);
              }
            });

            setResults(combined);
          } catch (error) {
            console.error('Search API error:', error);
            setResults(filteredNavItems);
          }
        } else {
          setResults(filteredNavigationItems);
        }
      } catch (error) {
        console.error('Search error:', error);
        // Fall back to navigation items
        setResults(filteredNavigationItems);
      } finally {
        setIsLoading(false);
      }
    };

    search();
  }, [debouncedSearchQuery]);

  const handleSelect = (result: SearchResult) => {
    onOpenChange(false);
    navigate(result.url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 max-w-[550px]">
        <Command className="rounded-lg border shadow-md">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              ref={inputRef}
              placeholder="Search everything..."
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
          </div>
          <CommandList>
            {isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                </div>
              </div>
            ) : (
              <>
                <CommandEmpty>No results found.</CommandEmpty>
                {results.length > 0 && (
                  <CommandGroup heading="Navigation">
                    {results
                      .filter(item => item.type === 'navigation')
                      .map(item => (
                        <CommandItem
                          key={item.id}
                          value={item.title}
                          onSelect={() => handleSelect(item)}
                          className="flex items-center"
                        >
                          {item.icon || <Database className="mr-2 h-4 w-4" />}
                          <span>{item.title}</span>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                )}
                {results.filter(item => item.type === 'content').length > 0 && (
                  <CommandGroup heading="Content">
                    {results
                      .filter(item => item.type === 'content')
                      .map(item => (
                        <CommandItem
                          key={item.id}
                          value={item.title}
                          onSelect={() => handleSelect(item)}
                          className="flex items-center"
                        >
                          {item.icon || <FileText className="mr-2 h-4 w-4" />}
                          <div>
                            <div>{item.title}</div>
                            {item.description && (
                              <p className="text-xs text-muted-foreground truncate">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
