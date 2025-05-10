
// In the <DataFilters> component in Files.tsx:

<DataFilters
  filters={{ search: searchTerm }}
  setFilters={(newFilters) => {
    setSearchTerm(newFilters.search as string);
    const updateSearchParams = (filters: QueryFilters) => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.set(key, value.toString());
        }
      });
      setSearchParams(params);
    };
    updateSearchParams(newFilters);
  }}
  resetFilters={() => {
    setSearchTerm("");
    setSearchParams({});
  }}
  options={filterOptions}
  onChange={(newFilters) => {
    setSearchTerm(newFilters.search as string);
    const updateSearchParams = (filters: QueryFilters) => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.set(key, value.toString());
        }
      });
      setSearchParams(params);
    };
    updateSearchParams(newFilters);
  }}
  onReset={() => {
    setSearchTerm("");
    setSearchParams({});
  }}
  className="mt-4"
/>
