import { type ChangeEvent, useMemo, useState } from 'react';

import type { ReviewFileSummary } from '../../../AppShell.types';

interface UseFileSidebarOptions {
  files: ReviewFileSummary[];
}

interface UseFileSidebarResult {
  searchQuery: string;
  filteredFiles: ReviewFileSummary[];
  setSearchQuery: (event: ChangeEvent<HTMLInputElement>) => void;
}

function matchesSearchQuery(file: ReviewFileSummary, normalizedQuery: string): boolean {
  return file.filePath.toLowerCase().includes(normalizedQuery);
}

// Filters the changed-file list by a locally-typed search query.
export function useFileSidebar({ files }: UseFileSidebarOptions): UseFileSidebarResult {
  const [searchQuery, setSearchQueryValue] = useState('');
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredFiles = useMemo(
    () =>
      normalizedQuery.length === 0
        ? files
        : files.filter(file => matchesSearchQuery(file, normalizedQuery)),
    [files, normalizedQuery],
  );

  return {
    searchQuery,
    filteredFiles,
    setSearchQuery: event => setSearchQueryValue(event.target.value),
  };
}
