import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Label } from '../ui/Label';
import { Textarea } from '../ui/Textarea';
import { useApproveCourseRequest } from '../../hooks/useCourses';
import { useToast } from '../ui/Toast';
import type { CourseRequest } from '../../types';

interface ApproveRequestModalProps {
  open: boolean;
  onClose: () => void;
  request: CourseRequest;
}

export function ApproveRequestModal({ open, onClose, request }: ApproveRequestModalProps) {
  const approve = useApproveCourseRequest();
  const toast = useToast();
  const [adminNote, setAdminNote] = useState('');

  const teacher = typeof request.teacherId === 'object' ? request.teacherId : null;

  const handleApprove = async () => {
    try {
      await approve.mutateAsync({ id: request._id, adminNote });
      toast('Course request approved!', 'success');
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast(error?.response?.data?.message ?? 'Failed to approve request', 'error');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Approve Course Request" size="md">
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-gray-500">Teacher:</span>
              <p className="font-medium">{teacher?.name ?? 'Unknown'}</p>
            </div>
            <div>
              <span className="text-gray-500">Course:</span>
              <p className="font-medium">{request.courseName}</p>
            </div>
          </div>
          {request.description && (
            <div>
              <span className="text-gray-500">Description:</span>
              <p className="text-gray-700">{request.description}</p>
            </div>
          )}
          {request.reason && (
            <div>
              <span className="text-gray-500">Reason:</span>
              <p className="text-gray-700">{request.reason}</p>
            </div>
          )}
        </div>
        <div>
          <Label htmlFor="approve-note">Admin Note (optional)</Label>
          <Textarea
            id="approve-note"
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            rows={3}
            placeholder="Add an optional note..."
          />
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" className="flex-1" onClick={handleApprove} loading={approve.isPending}>
            Approve Request
          </Button>
        </div>
      </div>
    </Modal>
  );
}
