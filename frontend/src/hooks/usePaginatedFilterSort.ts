import { useMemo, useState, useCallback } from "react";
import { useDebouncedValue } from "./useDebouncedValue";

export type SortOption =
  | "time_desc"
  | "time_asc"
  | "alphabet_asc"
  | "alphabet_desc";

type SortConfig<T> = {
  sort: SortOption;
  getTime: (item: T) => number;
  getAlphabet: (item: T) => string;
};

function sortItems<T>(items: T[], config: SortConfig<T>): T[] {
  const sorted = [...items];
  switch (config.sort) {
    case "time_desc":
      sorted.sort((a, b) => config.getTime(b) - config.getTime(a));
      break;
    case "time_asc":
      sorted.sort((a, b) => config.getTime(a) - config.getTime(b));
      break;
    case "alphabet_asc":
      sorted.sort((a, b) =>
        config.getAlphabet(a).localeCompare(config.getAlphabet(b)),
      );
      break;
    case "alphabet_desc":
      sorted.sort((a, b) =>
        config.getAlphabet(b).localeCompare(config.getAlphabet(a)),
      );
      break;
  }
  return sorted;
}

export type UsePaginatedFilterSortOptions<T> = {
  items: T[];
  pageSize?: number;
  defaultSort?: SortOption;
  searchFn?: (item: T, query: string) => boolean;
  getTime: (item: T) => number;
  getAlphabet: (item: T) => string;
  debounceMs?: number;
};

export type UsePaginatedFilterSortResult<T> = {
  query: string;
  setQuery: (value: string) => void;
  sort: SortOption;
  setSort: (value: SortOption) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalItems: number;
  totalPages: number;
  paginatedItems: T[];
  hasNextPage: boolean;
  hasPrevPage: boolean;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  goToPage: (page: number) => void;
};

export function usePaginatedFilterSort<T>(
  options: UsePaginatedFilterSortOptions<T>,
): UsePaginatedFilterSortResult<T> {
  const {
    items,
    pageSize = 20,
    defaultSort = "time_desc",
    searchFn,
    getTime,
    getAlphabet,
    debounceMs = 200,
  } = options;

  const [rawQuery, setRawQuery] = useState("");
  const [sort, setSort] = useState<SortOption>(defaultSort);
  const [currentPage, setCurrentPage] = useState(1);

  const query = useDebouncedValue(rawQuery, debounceMs);

  const filtered = useMemo(() => {
    if (!query.trim() || !searchFn) return items;
    const q = query.trim().toLowerCase();
    return items.filter((item) => searchFn(item, q));
  }, [items, query, searchFn]);

  const sorted = useMemo(
    () => sortItems(filtered, { sort, getTime, getAlphabet }),
    [filtered, sort, getTime, getAlphabet],
  );

  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Clamp current page when total pages shrinks
  const safePage = Math.min(currentPage, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    const end = start + pageSize;
    return sorted.slice(start, end);
  }, [sorted, safePage, pageSize]);

  const goToNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const goToPrevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, page));
  }, []);

  return {
    query: rawQuery,
    setQuery: setRawQuery,
    sort,
    setSort,
    currentPage: safePage,
    setCurrentPage,
    totalItems,
    totalPages,
    paginatedItems,
    hasNextPage: safePage < totalPages,
    hasPrevPage: safePage > 1,
    goToNextPage,
    goToPrevPage,
    goToPage,
  };
}
