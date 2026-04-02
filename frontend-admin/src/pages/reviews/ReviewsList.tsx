import { useState } from 'react';
import { Trash2, Eye, EyeOff, Star } from 'lucide-react';
import { useReviews, useDeleteReview, useToggleReviewPublic } from '../../hooks/useAdminData';
import { useToast } from '../../components/ui/Toast';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { SimpleBadge } from '../../components/ui/Badge';
import { Table, Thead, Tbody, Th, Td, Tr } from '../../components/ui/Table';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';
import { ConfirmActionModal } from '../../components/modals/ConfirmActionModal';
import { formatDate } from '../../lib/utils';
import type { Review, User } from '../../types';

const LIMIT = 15;

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 10 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}
        />
      ))}
      <span className="ml-1 text-xs font-medium text-gray-600">{rating}/10</span>
    </div>
  );
}

export function ReviewsList() {
  const [page, setPage] = useState(1);
  const [deleteReview, setDeleteReview] = useState<Review | null>(null);

  const { data, isLoading } = useReviews({ page, limit: LIMIT });
  const deleteReviewMut = useDeleteReview();
  const togglePublic = useToggleReviewPublic();
  const toast = useToast();

  const reviews = data?.data ?? [];
  const pagination = data?.pagination;

  const handleDelete = async () => {
    if (!deleteReview) return;
    try {
      await deleteReviewMut.mutateAsync(deleteReview._id);
      toast('Review deleted successfully.', 'success');
      setDeleteReview(null);
    } catch {
      toast('Failed to delete review.', 'error');
    }
  };

  const handleTogglePublic = async (review: Review) => {
    try {
      await togglePublic.mutateAsync(review._id);
      toast(`Review is now ${review.isPublic ? 'private' : 'public'}.`, 'success');
    } catch {
      toast('Failed to update review visibility.', 'error');
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <Table>
          <Thead>
            <tr>
              <Th>Student</Th>
              <Th>Teacher</Th>
              <Th>Rating</Th>
              <Th>Comment</Th>
              <Th>Visibility</Th>
              <Th>Date</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </Thead>
          <Tbody>
            {isLoading ? (
              <TableSkeleton rows={8} cols={7} />
            ) : reviews.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <EmptyState title="No reviews found" description="There are no reviews to moderate yet." />
                </td>
              </tr>
            ) : (
              reviews.map((review) => {
                const student = typeof review.studentId === 'object' ? (review.studentId as User) : null;
                const teacher = typeof review.teacherId === 'object' ? (review.teacherId as User) : null;
                return (
                  <Tr key={review._id}>
                    <Td>
                      <p className="font-medium text-gray-900">{student?.name ?? 'Unknown'}</p>
                    </Td>
                    <Td>
                      <p className="font-medium text-gray-900">{teacher?.name ?? 'Unknown'}</p>
                    </Td>
                    <Td>
                      <StarRating rating={review.rating} />
                    </Td>
                    <Td>
                      <p className="text-sm text-gray-600 max-w-xs truncate" title={review.comment}>
                        {review.comment ?? <span className="text-gray-400 italic">No comment</span>}
                      </p>
                    </Td>
                    <Td>
                      <SimpleBadge color={review.isPublic ? 'green' : 'gray'}>
                        {review.isPublic ? 'Public' : 'Private'}
                      </SimpleBadge>
                    </Td>
                    <Td className="text-gray-500 text-xs">{formatDate(review.createdAt)}</Td>
                    <Td>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTogglePublic(review)}
                          title={review.isPublic ? 'Make Private' : 'Make Public'}
                          className="text-blue-600 hover:bg-blue-50"
                        >
                          {review.isPublic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteReview(review)}
                          title="Delete"
                          className="text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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

      {deleteReview && (
        <ConfirmActionModal
          open={!!deleteReview}
          onClose={() => setDeleteReview(null)}
          onConfirm={handleDelete}
          title="Delete Review"
          message="Are you sure you want to permanently delete this review? This action cannot be undone."
          confirmLabel="Delete"
          variant="danger"
          loading={deleteReviewMut.isPending}
        />
      )}
    </div>
  );
}
