import {
  useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel,
  getPaginationRowModel, flexRender, type ColumnDef, type SortingState,
} from '@tanstack/react-table'
import { useState } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, Search, Inbox } from 'lucide-react'
import { clsx } from 'clsx'
import { EmptyState } from '@/components/shared/EmptyState'

interface DataTableProps<T> {
  data:    T[]
  columns: ColumnDef<T, any>[]
  searchable?: boolean
  searchPlaceholder?: string
  pageSize?: number
  /** Когато няма никакви редове в източника */
  emptyTitle?: string
  emptyDescription?: string
}

export function DataTable<T>({
  data,
  columns,
  searchable = true,
  searchPlaceholder = 'Търси...',
  pageSize = 10,
  emptyTitle = 'Няма записи',
  emptyDescription,
}: DataTableProps<T>) {
  const [sorting, setSorting]       = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const table = useReactTable({
    data,
    columns,
    state:     { sorting, globalFilter },
    onSortingChange:      setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel:       getCoreRowModel(),
    getFilteredRowModel:   getFilteredRowModel(),
    getSortedRowModel:     getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  })

  const rowCount = table.getRowModel().rows.length
  const filteredEmpty = data.length > 0 && rowCount === 0

  return (
    <div className="flex flex-col gap-3">
      {/* Search */}
      {searchable && (
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" />
          <input
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full h-10 pl-9 pr-4 bg-white border border-surface-200 rounded-xl text-sm outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 transition-colors"
            style={{ boxShadow: 'var(--shadow-card)' }}
          />
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id} className="border-b border-surface-100 bg-surface-50">
                  {hg.headers.map(header => (
                    <th key={header.id} className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider whitespace-nowrap">
                      {header.isPlaceholder ? null : (
                        <button
                          type="button"
                          className={clsx('flex items-center gap-1', header.column.getCanSort() && 'cursor-pointer hover:text-surface-700')}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            header.column.getIsSorted() === 'asc' ? <ChevronUp size={12} /> :
                            header.column.getIsSorted() === 'desc' ? <ChevronDown size={12} /> :
                            <ChevronsUpDown size={12} className="opacity-40" />
                          )}
                        </button>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-surface-100">
              {rowCount === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="p-0 align-top">
                    {filteredEmpty ? (
                      <EmptyState
                        icon={Search}
                        tone="brand"
                        title="Няма съвпадения"
                        description="Промени текста в полето за търсене или изчисти филтъра."
                        size="compact"
                        className="py-10 px-4"
                      />
                    ) : (
                      <EmptyState
                        icon={Inbox}
                        tone="teal"
                        title={emptyTitle}
                        description={emptyDescription}
                        size="compact"
                        className="py-10 px-4"
                      />
                    )}
                  </td>
                </tr>
              ) : table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-surface-50 transition-colors">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-4 py-3 text-surface-700 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-surface-100 bg-surface-50">
          <p className="text-xs text-surface-400">
            {table.getFilteredRowModel().rows.length} резултата
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-surface-500">
              Стр. {table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1}
            </span>
            <button
              type="button"
              onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-surface-200 text-surface-500 hover:bg-surface-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-surface-200 text-surface-500 hover:bg-surface-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
