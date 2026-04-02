import { useState } from 'react';
import { useReservations } from '../../hooks/useAdminData';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Table, Thead, Tbody, Th, Td, Tr } from '../../components/ui/Table';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';
import { formatDate } from '../../lib/utils';
import { cn } from '../../lib/utils';
import type { User, Course } from '../../types';

const tabs = [
  { label: 'All', value: '' },
  { label: 'Pending Payment', value: 'pending_payment_upload' },
  { label: 'Pending Review', value: 'pending_review' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Completed', value: 'completed' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Cancelled', value: 'cancelled' },
];

const LIMIT = 15;

export function ReservationsList() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useReservations({
    status: status || undefined,
    page,
    limit: LIMIT,
  });

  const reservations = data?.data ?? [];
  const pagination = data?.pagination;

  const handleTabChange = (val: string) => {
    setStatus(val);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Tabs — scrollable on mobile */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap',
              status === tab.value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Card>
        <Table>
          <Thead>
            <tr>
              <Th>Student</Th>
              <Th>Teacher</Th>
              <Th>Course</Th>
              <Th>Date</Th>
              <Th>Status</Th>
              <Th>Created</Th>
            </tr>
          </Thead>
          <Tbody>
            {isLoading ? (
              <TableSkeleton rows={8} cols={6} />
            ) : reservations.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState title="No reservations found" description="No reservations match the current filter." />
                </td>
              </tr>
            ) : (
              reservations.map((res) => {
                const student = typeof res.studentId === 'object' ? (res.studentId as User) : null;
                const teacher = typeof res.teacherId === 'object' ? (res.teacherId as User) : null;
                const course = typeof res.courseId === 'object' ? (res.courseId as Course) : null;

                return (
                  <Tr key={res._id}>
                    <Td>
                      <div>
                        <p className="font-medium text-gray-900">{student?.name ?? 'Unknown'}</p>
                        <p className="text-xs text-gray-400">{student?.email ?? ''}</p>
                      </div>
                    </Td>
                    <Td>
                      <div>
                        <p className="font-medium">{teacher?.name ?? 'Unknown'}</p>
                        <p className="text-xs text-gray-400">{teacher?.email ?? ''}</p>
                      </div>
                    </Td>
                    <Td>
                      <span className="text-sm">{course?.name ?? '—'}</span>
                    </Td>
                    <Td>
                      <div>
                        <p className="text-sm">{formatDate(res.date)}</p>
                        {res.startTime && (
                          <p className="text-xs text-gray-400">{res.startTime}{res.endTime ? ` – ${res.endTime}` : ''}</p>
                        )}
                      </div>
                    </Td>
                    <Td>
                      <Badge status={res.status} />
                    </Td>
                    <Td className="text-gray-500 text-xs">{formatDate(res.createdAt)}</Td>
                  </Tr>
                );
              })
            )}
          </Tbody>
        </Table>
        {pagination && pagination.totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
            total={pagination.total}
            limit={LIMIT}
          />
        )}
      </Card>
    </div>
  );
}
