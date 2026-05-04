import { useState, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { toast } from 'sonner'
import { CheckCircle, XCircle } from 'lucide-react'
import { type ColumnDef, type CellContext } from '@tanstack/react-table'
import { MOCK_PROFILES } from '@/lib/mock/data'
import { DataTable } from '@/components/admin/DataTable'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { AnimatedPage } from '@/components/shared/AnimatedPage'

interface EnrollRequest {
  id:         string
  user:       { id: string; full_name: string | null; email: string; avatar_url: string | null }
  profession: string
  iban:       string
  status:     'pending' | 'approved' | 'rejected'
  created_at: string
}

const MOCK_ENROLLMENTS: EnrollRequest[] = MOCK_PROFILES.filter(p => p.role === 'customer').slice(0, 4).map((p, i) => ({
  id:         `enr-${i + 1}`,
  user:       { id: p.id, full_name: p.full_name, email: p.email, avatar_url: p.avatar_url },
  profession: ['Масажист', 'Ски учител', 'Фотограф', 'Фитнес треньор'][i],
  iban:       `BG${80 + i}BNBG966010${i}45678`,
  status:     i === 0 ? 'pending' : i === 1 ? 'approved' : 'rejected',
  created_at: new Date(Date.now() - i * 86400000).toISOString(),
}))

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState(MOCK_ENROLLMENTS)

  const approve = (id: string) => {
    setEnrollments(es => es.map(e => e.id === id ? { ...e, status: 'approved' } : e))
    toast.success('Заявката е одобрена. Потребителят е повишен до Доставчик.')
  }
  const reject = (id: string) => {
    setEnrollments(es => es.map(e => e.id === id ? { ...e, status: 'rejected' } : e))
    toast.success('Заявката е отказана.')
  }

  const STATUS_BADGE: Record<EnrollRequest['status'], Parameters<typeof Badge>[0]['variant']> = {
    pending:  'warning',
    approved: 'success',
    rejected: 'neutral',
  }
  const STATUS_LABEL: Record<EnrollRequest['status'], string> = {
    pending:  'Чакаща',
    approved: 'Одобрена',
    rejected: 'Отказана',
  }

  const columns = useMemo<ColumnDef<EnrollRequest>[]>(() => [
    {
      header: 'Потребител',
      accessorKey: 'user.full_name',
      cell: ({ row }: CellContext<EnrollRequest, unknown>) => (
        <div className="flex items-center gap-3 py-0.5">
          <Avatar src={row.original.user.avatar_url} name={row.original.user.full_name ?? 'Потребител'} size="sm" />
          <div>
            <p className="font-medium text-surface-800">{row.original.user.full_name}</p>
            <p className="text-xs text-surface-400">{row.original.user.email}</p>
          </div>
        </div>
      ),
    },
    { header: 'Специалност', accessorKey: 'profession' },
    {
      header: 'IBAN',
      accessorKey: 'iban',
      cell: ({ getValue }: CellContext<EnrollRequest, unknown>) => <span className="font-mono text-xs text-surface-600">{getValue() as string}</span>,
    },
    {
      header: 'Статус',
      accessorKey: 'status',
      cell: ({ getValue }: CellContext<EnrollRequest, unknown>) => {
        const sv = getValue() as EnrollRequest['status']
        return <Badge variant={STATUS_BADGE[sv]}>{STATUS_LABEL[sv]}</Badge>
      },
    },
    {
      header: 'Дата',
      accessorKey: 'created_at',
      cell: ({ getValue }: CellContext<EnrollRequest, unknown>) => <span className="text-xs text-surface-400">{(getValue() as string).slice(0, 10)}</span>,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }: CellContext<EnrollRequest, unknown>) => row.original.status === 'pending' ? (
        <div className="flex gap-2">
          <Button size="sm" leftIcon={<CheckCircle size={13} />} onClick={() => approve(row.original.id)}>Одобри</Button>
          <Button size="sm" variant="outline" leftIcon={<XCircle size={13} />} onClick={() => reject(row.original.id)}>Откажи</Button>
        </div>
      ) : null,
    },
  ], [])

  const pending = enrollments.filter(e => e.status === 'pending').length

  return (
    <AnimatedPage className="min-h-screen bg-surface-50">
      <Helmet><title>Заявки – Admin – Vikni.me</title></Helmet>
      <div className="bg-white border-b border-surface-100 safe-top">
        <div className="max-w-6xl mx-auto px-5 py-5">
          <h1 className="font-display text-xl font-bold text-navy-500">
            Заявки за доставчик
            {pending > 0 && <span className="ml-2 text-sm bg-orange-500 text-white px-2 py-0.5 rounded-full">{pending}</span>}
          </h1>
          <p className="text-surface-400 text-sm">{enrollments.length} общо</p>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-5 py-5">
        <DataTable data={enrollments} columns={columns} searchPlaceholder="Търси заявка..." />
      </div>
    </AnimatedPage>
  )
}
