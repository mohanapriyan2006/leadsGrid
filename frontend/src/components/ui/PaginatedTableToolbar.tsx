import { Search, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { SortOption } from "../../hooks/usePaginatedFilterSort";

type PaginatedTableToolbarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  sort: SortOption;
  onSortChange: (value: SortOption) => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onPageChange?: (page: number) => void;
  placeholder?: string;
  className?: string;
};

const SORT_LABELS: Record<SortOption, { label: string; icon: React.ReactNode }> = {
  time_desc: { label: "Time: Newest", icon: <ArrowDown className="h-3 w-3" /> },
  time_asc: { label: "Time: Oldest", icon: <ArrowUp className="h-3 w-3" /> },
  alphabet_asc: { label: "Name: A-Z", icon: <ArrowUp className="h-3 w-3" /> },
  alphabet_desc: { label: "Name: Z-A", icon: <ArrowDown className="h-3 w-3" /> },
};

export const PaginatedTableToolbar = ({
  query,
  onQueryChange,
  sort,
  onSortChange,
  currentPage,
  totalPages,
  totalItems,
  onPrevPage,
  onNextPage,
  onPageChange,
  placeholder = "Search...",
  className = "",
}: PaginatedTableToolbarProps) => {
  const pageOptions = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-content-tertiary" />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={placeholder}
          className="glass-input w-full pl-9 pr-3 py-2 text-sm"
        />
      </div>

      {/* Sort */}
      <div className="relative">
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="glass-input appearance-none pr-8 pl-3 py-2 text-sm min-w-[140px] cursor-pointer"
        >
          {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
            <option key={key} value={key}>
              {SORT_LABELS[key].label}
            </option>
          ))}
        </select>
        <ArrowUpDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-content-tertiary" />
      </div>

      {/* Pagination */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-content-secondary hidden sm:inline">
          {totalItems} total
        </span>
        <button
          type="button"
          onClick={onPrevPage}
          disabled={currentPage <= 1}
          className="glass-btn px-2 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <select
          value={currentPage}
          onChange={(e) => onPageChange?.(Number(e.target.value))}
          className="glass-input appearance-none px-2 py-1.5 text-sm min-w-[60px] text-center cursor-pointer"
        >
          {pageOptions.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <span className="text-xs text-content-secondary">/ {totalPages}</span>

        <button
          type="button"
          onClick={onNextPage}
          disabled={currentPage >= totalPages}
          className="glass-btn px-2 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
