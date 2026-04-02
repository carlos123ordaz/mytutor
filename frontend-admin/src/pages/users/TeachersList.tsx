import { useState, useRef, useEffect } from 'react';
import { Search, CheckCircle, XCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import { useTeachers, useToggleTeacherApproval, useToggleUserActive } from '../../hooks/useAdminData';
import { useToast } from '../../components/ui/Toast';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, Thead, Tbody, Th, Td, Tr } from '../../components/ui/Table';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';
import { ConfirmActionModal } from '../../components/modals/ConfirmActionModal';
import { formatDate } from '../../lib/utils';
import type { TeacherProfile, User } from '../../types';

const approvalOptions = [
  { value: '', label: 'All' },
  { value: 'true', label: 'Approved' },
  { value: 'false', label: 'Pending' },
];

const LIMIT = 15;

export function TeachersList() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isApproved, setIsApproved] = useState('');
  const [page, setPage] = useState(1);
  const [confirmApproval, setConfirmApproval] = useState<TeacherProfile | null>(null);
  const [confirmActive, setConfirmActive] = useState<{ profile: TeacherProfile; user: User } | null>(null);

  const { data, isLoading } = useTeachers({
    search: debouncedSearch || undefined,
    isApproved: isApproved || undefined,
    page,
    limit: LIMIT,
  });

  const toggleApproval = useToggleTeacherApproval();
  const toggleActive = useToggleUserActive();
  const toast = useToast();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const teachers = data?.data ?? [];
  const pagination = data?.pagination;

  const handleSearch = (val: string) => {
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 400);
  };

  const handleConfirmApproval = async () => {
    if (!confirmApproval) return;
    try {
      await toggleApproval.mutateAsync({
        id: confirmApproval._id,
        isApproved: !confirmApproval.isApproved,
      });
      toast(`Teacher ${!confirmApproval.isApproved ? 'approved' : 'revoked'} successfully.`, 'success');
      setConfirmApproval(null);
    } catch {
      toast('Failed to update teacher approval.', 'error');
    }
  };

  const handleConfirmActive = async () => {
    if (!confirmActive) return;
    const { user } = confirmActive;
    try {
      await toggleActive.mutateAsync({ id: user._id, isActive: !user.isActive });
      toast(`Teacher ${!user.isActive ? 'activated' : 'deactivated'} successfully.`, 'success');
      setConfirmActive(null);
    } catch {
      toast('Failed to update teacher status.', 'error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search teachers..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={isApproved}
          onChange={(e) => { setIsApproved(e.target.value); setPage(1); }}
          options={approvalOptions}
          className="w-44"
        />
      </div>

      <Card>
        <Table>
          <Thead>
            <tr>
              <Th>Teacher</Th>
              <Th>Rating</Th>
              <Th>Approval</Th>
              <Th>Active</Th>
              <Th>Joined</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </Thead>
          <Tbody>
            {isLoading ? (
              <TableSkeleton rows={8} cols={6} />
            ) : teachers.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState title="No teachers found" description="Try adjusting your search or filter." />
                </td>
              </tr>
            ) : (
              teachers.map((profile) => {
                const user = typeof profile.userId === 'object' ? profile.userId : null;
                return (
                  <Tr key={profile._id}>
                    <Td>
                      <div className="flex items-center gap-3">
                        {user?.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">
                            {user?.name?.charAt(0).toUpperCase() ?? 'T'}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{user?.name ?? 'Unknown'}</p>
                          <p className="text-xs text-gray-400">{user?.email ?? ''}</p>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      {profile.rating != null ? (
                        <span className="text-sm font-medium">
                          {profile.rating.toFixed(1)}
                          <span className="text-gray-400 text-xs ml-1">({profile.reviewCount ?? 0})</span>
                        </span>
                      ) : '—'}
                    </Td>
                    <Td>
                      <Badge status={profile.isApproved ? 'approved' : 'pending'} />
                    </Td>
                    <Td>
                      <Badge status={user?.isActive ? 'active' : 'inactive'} />
                    </Td>
                    <Td className="text-gray-500 text-xs">{formatDate(profile.createdAt)}</Td>
                    <Td>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setConfirmApproval(profile)}
                          className={profile.isApproved ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}
                          title={profile.isApproved ? 'Revoke Approval' : 'Approve'}
                        >
                          {profile.isApproved ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          <span className="hidden sm:inline">{profile.isApproved ? 'Revoke' : 'Approve'}</span>
                        </Button>
                        {user && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setConfirmActive({ profile, user })}
                            className={user.isActive ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}
                            title={user.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {user.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                          </Button>
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

      {confirmApproval && (
        <ConfirmActionModal
          open={!!confirmApproval}
          onClose={() => setConfirmApproval(null)}
          onConfirm={handleConfirmApproval}
          title={confirmApproval.isApproved ? 'Revoke Approval' : 'Approve Teacher'}
          message={`Are you sure you want to ${confirmApproval.isApproved ? 'revoke approval from' : 'approve'} this teacher?`}
          confirmLabel={confirmApproval.isApproved ? 'Revoke' : 'Approve'}
          variant={confirmApproval.isApproved ? 'danger' : 'primary'}
          loading={toggleApproval.isPending}
        />
      )}

      {confirmActive && (
        <ConfirmActionModal
          open={!!confirmActive}
          onClose={() => setConfirmActive(null)}
          onConfirm={handleConfirmActive}
          title={confirmActive.user.isActive ? 'Deactivate Teacher' : 'Activate Teacher'}
          message={`Are you sure you want to ${confirmActive.user.isActive ? 'deactivate' : 'activate'} ${confirmActive.user.name}?`}
          confirmLabel={confirmActive.user.isActive ? 'Deactivate' : 'Activate'}
          variant={confirmActive.user.isActive ? 'danger' : 'primary'}
          loading={toggleActive.isPending}
        />
      )}
    </div>
  );
}
