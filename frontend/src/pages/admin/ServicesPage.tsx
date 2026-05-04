import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { toast } from 'sonner'
import { Eye, Trash2, Star } from 'lucide-react'
import { type ColumnDef, type CellContext } from '@tanstack/react-table'
import { MOCK_SERVICES } from '@/lib/mock/data'
import { DataTable } from '@/components/admin/DataTable'
import { Badge } from '@/components/ui/Badge'
import { AnimatedPage } from '@/components/shared/AnimatedPage'
import type { ServiceWithRelations } from '@/api/services'

export default function AdminServicesPage() {
  const [services, setServices] = useState([...MOCK_SERVICES])

  const columns = useMemo<ColumnDef<ServiceWithRelations>[]>(() => [
    {
      header: 'Услуга',
      accessorKey: 'title',
      cell: ({ row }: CellContext<ServiceWithRelations, unknown>) => (
        <div className="flex items-center gap-3 py-0.5">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-100 shrink-0">
            {row.original.images[0]
              ? <img src={row.original.images[0]} alt="" className="w-full h-full object-cover" />
              : <div className="w-full h-full" style={{ background: 'var(--gradient-brand)' }} />}
          </div>
          <div>
            <p className="font-medium text-surface-800 max-w-[200px] truncate">{row.original.title}</p>
            <p className="text-xs text-surface-400">{row.original.location}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Категория',
      accessorKey: 'categories.name',
      cell: ({ row }: CellContext<ServiceWithRelations, unknown>) => row.original.categories
        ? <Badge variant="neutral">{row.original.categories.name}</Badge>
        : <span className="text-surface-300 text-xs">—</span>,
    },
    {
      header: 'Цена',
      accessorKey: 'price',
      cell: ({ row }: CellContext<ServiceWithRelations, unknown>) => <span className="font-semibold text-navy-500">{row.original.price} лв.</span>,
    },
    {
      header: 'Рейтинг',
      accessorKey: 'avg_rating',
      cell: ({ getValue }: CellContext<ServiceWithRelations, unknown>) => (
        <div className="flex items-center gap-1">
          <Star size={13} className="text-orange-400 fill-orange-400" />
          <span className="font-medium">{(getValue() as number).toFixed(1)}</span>
        </div>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }: CellContext<ServiceWithRelations, unknown>) => (
        <div className="flex items-center gap-1">
          <Link to={`/service/${row.original.id}`}
            className="p-1.5 rounded-lg hover:bg-surface-100 transition-colors text-surface-500" title="Преглед">
            <Eye size={15} />
          </Link>
          <button
            onClick={() => {
              if (confirm(`Изтрий "${row.original.title}"?`)) {
                setServices(ss => ss.filter(s => s.id !== row.original.id))
                toast.success('Услугата е изтрита.')
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
      <Helmet><title>Услуги – Admin – Vikni.me</title></Helmet>
      <div className="bg-white border-b border-surface-100 safe-top">
        <div className="max-w-6xl mx-auto px-5 py-5">
          <h1 className="font-display text-xl font-bold text-navy-500">Услуги</h1>
          <p className="text-surface-400 text-sm">{services.length} публикувани</p>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-5 py-5">
        <DataTable data={services} columns={columns} searchPlaceholder="Търси услуга..." />
      </div>
    </AnimatedPage>
  )
}
