import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Trash2, Star } from 'lucide-react'
import { format } from 'date-fns'
import { bg } from 'date-fns/locale'
import { toast } from 'sonner'
import { AnimatedPage } from '@/components/shared/AnimatedPage'
import { DataTable } from '@/components/admin/DataTable'
import { Avatar } from '@/components/ui/Avatar'
import { MOCK_REVIEWS } from '@/lib/mock/data'
import type { ColumnDef, CellContext } from '@tanstack/react-table'

type ReviewItem = typeof MOCK_REVIEWS[number]

function StarBadge({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={11} className={i < rating ? 'text-orange-400 fill-orange-400' : 'text-surface-200 fill-surface-200'} />
      ))}
      <span className="text-xs text-surface-500 ml-1">{rating}.0</span>
    </div>
  )
}

export default function AdminReviewsPage() {
  const [data, setData] = useState<ReviewItem[]>([...MOCK_REVIEWS])

  function deleteReview(id: string) {
    if (!window.confirm('Изтрий този отзив?')) return
    setData(prev => prev.filter(r => r.id !== id))
    toast.success('Отзивът е изтрит')
  }

  const avgRating = data.length ? (data.reduce((s, r) => s + r.rating, 0) / data.length).toFixed(1) : '—'

  const columns: ColumnDef<ReviewItem>[] = [
    {
      accessorKey: 'reviewer',
      header: 'Автор',
      cell: ({ row }: CellContext<ReviewItem, unknown>) => (
        <div className="flex items-center gap-2">
          <Avatar src={row.original.reviewer.avatar_url} name={row.original.reviewer.full_name} size="xs" />
          <span className="text-sm font-medium text-surface-800">{row.original.reviewer.full_name}</span>
        </div>
      ),
    },
    {
      accessorKey: 'rating',
      header: 'Оценка',
      cell: ({ row }: CellContext<ReviewItem, unknown>) => <StarBadge rating={row.original.rating} />,
    },
    {
      accessorKey: 'comment',
      header: 'Коментар',
      cell: ({ row }: CellContext<ReviewItem, unknown>) => (
        <p className="text-sm text-surface-600 max-w-xs line-clamp-2">{row.original.comment ?? '—'}</p>
      ),
    },
    {
      accessorKey: 'service_id',
      header: 'Услуга',
      cell: ({ row }: CellContext<ReviewItem, unknown>) => (
        <span className="text-xs font-mono text-surface-400">{row.original.service_id}</span>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Дата',
      cell: ({ row }: CellContext<ReviewItem, unknown>) => (
        <span className="text-xs text-surface-500">
          {format(new Date(row.original.created_at), 'dd MMM yyyy', { locale: bg })}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Действия',
      cell: ({ row }: CellContext<ReviewItem, unknown>) => (
        <button onClick={() => deleteReview(row.original.id)}
          className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 transition-colors"
          title="Изтрий">
          <Trash2 size={13} />
        </button>
      ),
    },
  ]

  return (
    <AnimatedPage className="min-h-screen bg-surface-50">
      <Helmet><title>Отзиви – Admin – Vikni.me</title></Helmet>

      <div className="bg-white border-b border-surface-100 safe-top">
        <div className="max-w-7xl mx-auto px-5 py-5 flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-bold text-navy-500">Отзиви</h1>
            <p className="text-sm text-surface-400 mt-0.5">{data.length} отзива · среден рейтинг {avgRating} ★</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 py-6">
        <DataTable data={data} columns={columns} />
      </div>
    </AnimatedPage>
  )
}
