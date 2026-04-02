import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Label } from '../ui/Label';
import { Textarea } from '../ui/Textarea';
import { useRejectCourseRequest } from '../../hooks/useCourses';
import { useToast } from '../ui/Toast';
import type { CourseRequest } from '../../types';

interface RejectRequestModalProps {
  open: boolean;
  onClose: () => void;
  request: CourseRequest;
}

export function RejectRequestModal({ open, onClose, request }: RejectRequestModalProps) {
  const reject = useRejectCourseRequest();
  const toast = useToast();
  const [adminNote, setAdminNote] = useState('');
  const [error, setError] = useState('');

  const teacher = typeof request.teacherId === 'object' ? request.teacherId : null;

  const handleReject = async () => {
    if (!adminNote.trim()) {
      setError('Admin note is required for rejection');
      return;
    }
    setError('');
    try {
      await reject.mutateAsync({ id: request._id, adminNote });
      toast('Course request rejected.', 'info');
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast(e?.response?.data?.message ?? 'Failed to reject request', 'error');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Reject Course Request" size="md">
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
          {request.reason && (
            <div>
              <span className="text-gray-500">Reason:</span>
              <p className="text-gray-700">{request.reason}</p>
            </div>
          )}
        </div>
        <div>
          <Label htmlFor="reject-note">Admin Note * (required)</Label>
          <Textarea
            id="reject-note"
            value={adminNote}
            onChange={(e) => { setAdminNote(e.target.value); setError(''); }}
            rows={3}
            placeholder="Explain why this request is being rejected..."
            error={error}
          />
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" className="flex-1" onClick={handleReject} loading={reject.isPending}>
            Reject Request
          </Button>
        </div>
      </div>
    </Modal>
  );
}
