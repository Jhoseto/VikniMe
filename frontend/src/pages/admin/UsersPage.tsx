import { useState, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { toast } from 'sonner'
import { Ban, CheckCircle, Trash2 } from 'lucide-react'
import { type ColumnDef, type CellContext } from '@tanstack/react-table'
import { MOCK_PROFILES } from '@/lib/mock/data'
import { DataTable } from '@/components/admin/DataTable'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { AnimatedPage } from '@/components/shared/AnimatedPage'
import type { ProfileRow } from '@/types/database'

export default function AdminUsersPage() {
  const [users, setUsers] = useState([...MOCK_PROFILES])

  const columns = useMemo<ColumnDef<ProfileRow>[]>(() => [
    {
      header: 'Потребител',
      accessorKey: 'full_name',
      cell: ({ row }: CellContext<ProfileRow, unknown>) => (
        <div className="flex items-center gap-3 py-0.5">
          <Avatar src={row.original.avatar_url} name={row.original.full_name} userId={row.original.id} size="sm" />
          <div>
            <p className="font-medium text-surface-800">{row.original.full_name}</p>
            <p className="text-xs text-surface-400">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Роля',
      accessorKey: 'role',
      cell: ({ getValue }: CellContext<ProfileRow, unknown>) => {
        const role = getValue() as ProfileRow['role']
        return (
          <Badge variant={role === 'admin' ? 'violet' : role === 'supplier' ? 'navy' : 'neutral'}>
            {role === 'admin' ? 'Admin' : role === 'supplier' ? 'Доставчик' : 'Клиент'}
          </Badge>
        )
      },
    },
    {
      header: 'Верифициран',
      accessorKey: 'is_verified',
      cell: ({ getValue }: CellContext<ProfileRow, unknown>) => getValue()
        ? <CheckCircle size={16} className="text-green-500" />
        : <span className="text-surface-300 text-xs">—</span>,
    },
    {
      header: 'Кредити',
      accessorKey: 'credits',
      cell: ({ getValue }: CellContext<ProfileRow, unknown>) => <span className="font-semibold text-navy-500">{getValue() as number}</span>,
    },
    {
      header: 'Регистрация',
      accessorKey: 'created_at',
      cell: ({ getValue }: CellContext<ProfileRow, unknown>) => <span className="text-xs text-surface-500">{(getValue() as string).slice(0, 10)}</span>,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }: CellContext<ProfileRow, unknown>) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setUsers(us => us.map(u => u.id === row.original.id ? { ...u, is_verified: !u.is_verified } : u))
              toast.success(row.original.is_verified ? 'Верификацията е премахната.' : 'Потребителят е верифициран.')
            }}
            className="p-1.5 rounded-lg hover:bg-surface-100 transition-colors text-surface-500"
            title={row.original.is_verified ? 'Премахни верификация' : 'Верифицирай'}
          >
            <CheckCircle size={15} />
          </button>
          <button
            onClick={() => toast.info('Бан – предстои интеграция с backend.')}
            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-surface-500 hover:text-error"
            title="Бан"
          >
            <Ban size={15} />
          </button>
          <button
            onClick={() => {
              if (confirm(`Изтрий ${row.original.full_name}?`)) {
                setUsers(us => us.filter(u => u.id !== row.original.id))
                toast.success('Потребителят е изтрит.')
              }
            }}
            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-surface-500 hover:text-error"
            title="Изтрий"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ], [])

  return (
    <AnimatedPage className="min-h-screen bg-surface-50">
      <Helmet><title>Потребители – Admin – Vikni.me</title></Helmet>
      <div className="bg-white border-b border-surface-100 safe-top">
        <div className="max-w-6xl mx-auto px-5 py-5">
          <h1 className="font-display text-xl font-bold text-navy-500">Потребители</h1>
          <p className="text-surface-400 text-sm">{users.length} регистрирани</p>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-5 py-5">
        <DataTable data={users} columns={columns} searchPlaceholder="Търси потребител..." />
      </div>
    </AnimatedPage>
  )
}
