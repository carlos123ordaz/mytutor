import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { useCourseRequests } from '../../hooks/useCourses';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, Thead, Tbody, Th, Td, Tr } from '../../components/ui/Table';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';
import { ApproveRequestModal } from '../../components/modals/ApproveRequestModal';
import { RejectRequestModal } from '../../components/modals/RejectRequestModal';
import { formatDate } from '../../lib/utils';
import type { CourseRequest } from '../../types';
import { cn } from '../../lib/utils';

const tabs = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
];

const LIMIT = 15;

export function CourseRequests() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [approveRequest, setApproveRequest] = useState<CourseRequest | null>(null);
  const [rejectRequest, setRejectRequest] = useState<CourseRequest | null>(null);

  const { data, isLoading } = useCourseRequests({ status: status || undefined, page, limit: LIMIT });
  const requests = data?.data ?? [];
  const pagination = data?.pagination;

  const handleTabChange = (val: string) => {
    setStatus(val);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={cn(
              'px-4 py-1.5 text-sm font-medium rounded-md transition-colors',
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
              <Th>Teacher</Th>
              <Th>Course</Th>
              <Th>Category</Th>
              <Th>Status</Th>
              <Th>Date</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </Thead>
          <Tbody>
            {isLoading ? (
              <TableSkeleton rows={8} cols={6} />
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState title="No requests found" description="No course requests match your current filter." />
                </td>
              </tr>
            ) : (
              requests.map((req) => {
                const teacher = typeof req.teacherId === 'object' ? req.teacherId : null;
                return (
                  <Tr key={req._id}>
                    <Td>
                      <div>
                        <p className="font-medium text-gray-900">{teacher?.name ?? 'Unknown'}</p>
                        <p className="text-xs text-gray-400">{teacher?.email ?? ''}</p>
                      </div>
                    </Td>
                    <Td>
                      <div>
                        <p className="font-medium">{req.courseName}</p>
                        {req.description && (
                          <p className="text-xs text-gray-500 mt-0.5 max-w-xs truncate">{req.description}</p>
                        )}
                      </div>
                    </Td>
                    <Td>{req.category ?? '—'}</Td>
                    <Td>
                      <Badge status={req.status} />
                    </Td>
                    <Td className="text-gray-500 text-xs">{formatDate(req.createdAt)}</Td>
                    <Td>
                      <div className="flex items-center justify-end gap-2">
                        {req.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:bg-green-50"
                              onClick={() => setApproveRequest(req)}
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span>Approve</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:bg-red-50"
                              onClick={() => setRejectRequest(req)}
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>Reject</span>
                            </Button>
                          </>
                        )}
                        {req.adminNote && (
                          <span className="text-xs text-gray-400 italic max-w-xs truncate" title={req.adminNote}>
                            Note: {req.adminNote}
                          </span>
                        )}
                      </div>
                    </Td>
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

      {approveRequest && (
        <ApproveRequestModal
          open={!!approveRequest}
          onClose={() => setApproveRequest(null)}
          request={approveRequest}
        />
      )}
      {rejectRequest && (
        <RejectRequestModal
          open={!!rejectRequest}
          onClose={() => setRejectRequest(null)}
          request={rejectRequest}
        />
      )}
    </div>
  );
}
