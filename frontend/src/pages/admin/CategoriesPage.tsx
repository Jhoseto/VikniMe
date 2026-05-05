import { useState, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { toast } from 'sonner'
import { Plus, Trash2, Edit3 } from 'lucide-react'
import { type ColumnDef, type CellContext } from '@tanstack/react-table'
import { MOCK_CATEGORIES } from '@/lib/mock/data'
import { DataTable } from '@/components/admin/DataTable'
import { Button } from '@/components/ui/Button'
import { AnimatedPage } from '@/components/shared/AnimatedPage'
import type { CategoryRow } from '@/types/database'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([...MOCK_CATEGORIES])

  const columns = useMemo<ColumnDef<CategoryRow>[]>(() => [
    {
      header: 'Категория',
      accessorKey: 'name',
      cell: ({ row }: CellContext<CategoryRow, unknown>) => (
        <div className="flex items-center gap-3">
          <span className="text-2xl">{row.original.icon}</span>
          <div>
            <p className="font-medium text-surface-800">{row.original.name}</p>
            <p className="text-xs text-surface-400 font-mono">{row.original.slug}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'ID',
      accessorKey: 'id',
      cell: ({ getValue }: CellContext<CategoryRow, unknown>) => <span className="font-mono text-xs text-surface-400">{getValue() as string}</span>,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }: CellContext<CategoryRow, unknown>) => (
        <div className="flex items-center gap-1">
          <button onClick={() => toast.info('Редактиране – предстои')}
            className="p-1.5 rounded-lg hover:bg-surface-100 transition-colors text-surface-500" title="Редактирай">
            <Edit3 size={15} />
          </button>
          <button
            onClick={() => {
              if (confirm(`Изтрий "${row.original.name}"?`)) {
                setCategories(cs => cs.filter(c => c.id !== row.original.id))
                toast.success('Категорията е изтрита.')
              }
            }}
            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-surface-500 hover:text-error" title="Изтрий">
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ], [])

  return (
    <AnimatedPage className="min-h-screen bg-surface-50">
      <Helmet><title>Категории – Admin – Vikni.me</title></Helmet>
      <div className="bg-white border-b border-surface-100 safe-top">
        <div className="max-w-4xl mx-auto px-5 py-5 flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-bold text-navy-500">Категории</h1>
            <p className="text-surface-400 text-sm">{categories.length} категории</p>
          </div>
          <Button size="sm" leftIcon={<Plus size={15} />} onClick={() => toast.info('Добавяне – предстои')}>Добави</Button>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-5 py-5">
        <DataTable
          data={categories}
          columns={columns}
          searchPlaceholder="Търси категория..."
          emptyTitle="Няма категории"
          emptyDescription="Добави категории или синхронизирай с базата данни."
        />
      </div>
    </AnimatedPage>
  )
}
