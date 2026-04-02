import { useState, useRef, useEffect } from 'react';
import { Search, ToggleLeft, ToggleRight } from 'lucide-react';
import { useUsers, useToggleUserActive } from '../../hooks/useAdminData';
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
import type { User } from '../../types';

const roleOptions = [
  { value: '', label: 'All Roles' },
  { value: 'student', label: 'Student' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'admin', label: 'Admin' },
];

const activeOptions = [
  { value: '', label: 'All Status' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

const LIMIT = 15;

export function UsersList() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [role, setRole] = useState('');
  const [isActive, setIsActive] = useState('');
  const [page, setPage] = useState(1);
  const [confirmUser, setConfirmUser] = useState<User | null>(null);

  const { data, isLoading } = useUsers({
    search: debouncedSearch || undefined,
    role: role || undefined,
    isActive: isActive || undefined,
    page,
    limit: LIMIT,
  });

  const toggleActive = useToggleUserActive();
  const toast = useToast();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const users = data?.data ?? [];
  const pagination = data?.pagination;

  const handleSearch = (val: string) => {
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 400);
  };

  const handleConfirmToggle = async () => {
    if (!confirmUser) return;
    try {
      await toggleActive.mutateAsync({ id: confirmUser._id, isActive: !confirmUser.isActive });
      toast(`User ${!confirmUser.isActive ? 'activated' : 'deactivated'} successfully.`, 'success');
      setConfirmUser(null);
    } catch {
      toast('Failed to update user status.', 'error');
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={role}
          onChange={(e) => { setRole(e.target.value); setPage(1); }}
          options={roleOptions}
          className="w-40"
        />
        <Select
          value={isActive}
          onChange={(e) => { setIsActive(e.target.value); setPage(1); }}
          options={activeOptions}
          className="w-40"
        />
      </div>

      <Card>
        <Table>
          <Thead>
            <tr>
              <Th>User</Th>
              <Th>Role</Th>
              <Th>Status</Th>
              <Th>Joined</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </Thead>
          <Tbody>
            {isLoading ? (
              <TableSkeleton rows={8} cols={5} />
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <EmptyState title="No users found" description="Try adjusting your filters." />
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <Tr key={user._id}>
                  <Td>
                    <div className="flex items-center gap-3">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <span className="capitalize text-sm">{user.role}</span>
                  </Td>
                  <Td>
                    <Badge status={user.isActive ? 'active' : 'inactive'} />
                  </Td>
                  <Td className="text-gray-500 text-xs">{formatDate(user.createdAt)}</Td>
                  <Td>
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmUser(user)}
                        className={user.isActive ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}
                        title={user.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {user.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        <span>{user.isActive ? 'Deactivate' : 'Activate'}</span>
                      </Button>
                    </div>
                  </Td>
                </Tr>
              ))
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

      {confirmUser && (
        <ConfirmActionModal
          open={!!confirmUser}
          onClose={() => setConfirmUser(null)}
          onConfirm={handleConfirmToggle}
          title={confirmUser.isActive ? 'Deactivate User' : 'Activate User'}
          message={`Are you sure you want to ${confirmUser.isActive ? 'deactivate' : 'activate'} ${confirmUser.name}?`}
          confirmLabel={confirmUser.isActive ? 'Deactivate' : 'Activate'}
          variant={confirmUser.isActive ? 'danger' : 'primary'}
          loading={toggleActive.isPending}
        />
      )}
    </div>
  );
}
