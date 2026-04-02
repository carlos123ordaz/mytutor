import { useState, useRef, useEffect } from 'react';
import { Plus, Search, Pencil, ToggleLeft, ToggleRight } from 'lucide-react';
import { useCourses, useUpdateCourse } from '../../hooks/useCourses';
import { useToast } from '../../components/ui/Toast';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Table, Thead, Tbody, Th, Td, Tr } from '../../components/ui/Table';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { CreateCourseModal } from '../../components/modals/CreateCourseModal';
import { EditCourseModal } from '../../components/modals/EditCourseModal';
import { formatDate } from '../../lib/utils';
import type { Course } from '../../types';

const levelLabel: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  all_levels: 'All Levels',
};

export function CoursesList() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);

  const { data: courses, isLoading } = useCourses(debouncedSearch);
  const updateCourse = useUpdateCourse();
  const toast = useToast();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleSearch = (val: string) => {
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(val), 400);
  };

  const toggleActive = async (course: Course) => {
    try {
      await updateCourse.mutateAsync({ id: course._id, data: { isActive: !course.isActive } });
      toast(`Course ${!course.isActive ? 'activated' : 'deactivated'} successfully.`, 'success');
    } catch {
      toast('Failed to update course status.', 'error');
    }
  };

  const displayed = courses ?? [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4" />
          Create Course
        </Button>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <Thead>
            <tr>
              <Th>Name</Th>
              <Th>Category</Th>
              <Th>Level</Th>
              <Th>Status</Th>
              <Th>Created</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </Thead>
          <Tbody>
            {isLoading ? (
              <TableSkeleton rows={6} cols={6} />
            ) : displayed.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState title="No courses found" description="Create your first course to get started." />
                </td>
              </tr>
            ) : (
              displayed.map((course) => (
                <Tr key={course._id}>
                  <Td>
                    <div>
                      <p className="font-medium text-gray-900">{course.name}</p>
                      {course.tags && course.tags.length > 0 && (
                        <p className="text-xs text-gray-400 mt-0.5">{course.tags.slice(0, 3).join(', ')}</p>
                      )}
                    </div>
                  </Td>
                  <Td>{course.category ?? '—'}</Td>
                  <Td>{levelLabel[course.level] ?? course.level}</Td>
                  <Td>
                    <Badge status={course.isActive ? 'active' : 'inactive'} />
                  </Td>
                  <Td className="text-gray-500 text-xs">{formatDate(course.createdAt)}</Td>
                  <Td>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditCourse(course)}
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive(course)}
                        title={course.isActive ? 'Deactivate' : 'Activate'}
                        className={course.isActive ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}
                      >
                        {course.isActive ? (
                          <ToggleRight className="w-4 h-4" />
                        ) : (
                          <ToggleLeft className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Card>

      <CreateCourseModal open={showCreate} onClose={() => setShowCreate(false)} />
      {editCourse && (
        <EditCourseModal
          open={!!editCourse}
          onClose={() => setEditCourse(null)}
          course={editCourse}
        />
      )}
    </div>
  );
}
