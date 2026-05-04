import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { format } from 'date-fns'
import { bg } from 'date-fns/locale'
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { AnimatedPage } from '@/components/shared/AnimatedPage'
import { DataTable } from '@/components/admin/DataTable'
import { MOCK_BOOKINGS } from '@/lib/mock/data'
import type { ColumnDef, CellContext } from '@tanstack/react-table'
import { clsx } from 'clsx'
import { Link } from 'react-router-dom'

type BookingRow = typeof MOCK_BOOKINGS[number]

const STATUS_LABEL: Record<string, string> = {
  pending:    'Чакащо',
  confirmed:  'Потвърдено',
  active:     'Активно',
  completed:  'Завършено',
  cancelled:  'Отказано',
}
const STATUS_COLOR: Record<string, string> = {
  pending:   'bg-orange-100 text-orange-700',
  confirmed: 'bg-navy-100 text-navy-700',
  active:    'bg-teal-100 text-teal-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function AdminBookingsPage() {
  const [data, setData] = useState<BookingRow[]>([...MOCK_BOOKINGS])

  function updateStatus(id: string, status: 'confirmed' | 'cancelled') {
    setData(prev => prev.map(b => b.id === id ? { ...b, status } : b))
    toast.success(status === 'confirmed' ? 'Резервацията е потвърдена' : 'Резервацията е отказана')
  }

  const columns: ColumnDef<BookingRow>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }: CellContext<BookingRow, unknown>) => (
        <span className="text-xs text-surface-400 font-mono">{row.original.id.slice(0, 8)}</span>
      ),
    },
    {
      accessorKey: 'service',
      header: 'Услуга',
      cell: ({ row }: CellContext<BookingRow, unknown>) => (
        <div className="flex items-center gap-2 min-w-0">
          {row.original.service.images[0] && (
            <img src={row.original.service.images[0]} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />
          )}
          <p className="text-sm font-medium text-surface-800 truncate max-w-[180px]">{row.original.service.title}</p>
        </div>
      ),
    },
    {
      accessorKey: 'customer',
      header: 'Клиент',
      cell: ({ row }: CellContext<BookingRow, unknown>) => (
        <span className="text-sm text-surface-700">{row.original.customer.full_name}</span>
      ),
    },
    {
      accessorKey: 'supplier',
      header: 'Доставчик',
      cell: ({ row }: CellContext<BookingRow, unknown>) => (
        <span className="text-sm text-surface-700">{row.original.supplier.full_name}</span>
      ),
    },
    {
      accessorKey: 'scheduled_at',
      header: 'Дата',
      cell: ({ row }: CellContext<BookingRow, unknown>) => (
        <span className="text-sm text-surface-600">
          {row.original.scheduled_at ? format(new Date(row.original.scheduled_at), 'dd MMM yyyy, HH:mm', { locale: bg }) : '—'}
        </span>
      ),
    },
    {
      accessorKey: 'price',
      header: 'Цена',
      cell: ({ row }: CellContext<BookingRow, unknown>) => (
        <span className="font-semibold text-sm text-navy-500">{row.original.price} лв.</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Статус',
      cell: ({ row }: CellContext<BookingRow, unknown>) => (
        <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium', STATUS_COLOR[row.original.status] ?? 'bg-surface-100 text-surface-600')}>
          {STATUS_LABEL[row.original.status] ?? row.original.status}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Действия',
      cell: ({ row }: CellContext<BookingRow, unknown>) => (
        <div className="flex items-center gap-1.5">
          <Link to={`/bookings/${row.original.id}`}
            className="w-7 h-7 rounded-lg bg-surface-100 hover:bg-navy-100 flex items-center justify-center text-surface-500 hover:text-navy-600 transition-colors"
            title="Виж детайли">
            <Eye size={14} />
          </Link>
          {row.original.status === 'pending' && (
            <>
              <button onClick={() => updateStatus(row.original.id, 'confirmed')}
                className="w-7 h-7 rounded-lg bg-teal-50 hover:bg-teal-100 flex items-center justify-center text-teal-600 transition-colors"
                title="Потвърди">
                <CheckCircle size={14} />
              </button>
              <button onClick={() => updateStatus(row.original.id, 'cancelled')}
                className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 transition-colors"
                title="Откажи">
                <XCircle size={14} />
              </button>
            </>
          )}
        </div>
      ),
    },
  ]

  const pendingCount = data.filter(b => b.status === 'pending').length

  return (
    <AnimatedPage className="min-h-screen bg-surface-50">
      <Helmet><title>Резервации – Admin – Vikni.me</title></Helmet>

      <div className="bg-white border-b border-surface-100 safe-top">
        <div className="max-w-7xl mx-auto px-5 py-5 flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-bold text-navy-500">Резервации</h1>
            <p className="text-sm text-surface-400 mt-0.5">{data.length} общо</p>
          </div>
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-xl">
              <Clock size={14} className="text-orange-500" />
              <span className="text-xs font-semibold text-orange-700">{pendingCount} чакащи потвърждение</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 py-6">
        <DataTable data={data} columns={columns} />
      </div>
    </AnimatedPage>
  )
}
