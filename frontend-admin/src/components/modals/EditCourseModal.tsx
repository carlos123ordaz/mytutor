import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { useUpdateCourse } from '../../hooks/useCourses';
import { useToast } from '../ui/Toast';
import type { Course } from '../../types';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'all_levels']),
  tags: z.string().optional(),
  isActive: z.boolean(),
});

type FormData = z.infer<typeof schema>;

const levelOptions = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'all_levels', label: 'All Levels' },
];

interface EditCourseModalProps {
  open: boolean;
  onClose: () => void;
  course: Course;
}

export function EditCourseModal({ open, onClose, course }: EditCourseModalProps) {
  const updateCourse = useUpdateCourse();
  const toast = useToast();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (course) {
      reset({
        name: course.name,
        description: course.description ?? '',
        category: course.category ?? '',
        level: course.level,
        tags: course.tags?.join(', ') ?? '',
        isActive: course.isActive,
      });
    }
  }, [course, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      await updateCourse.mutateAsync({
        id: course._id,
        data: {
          ...data,
          tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        },
      });
      toast('Course updated successfully!', 'success');
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast(error?.response?.data?.message ?? 'Failed to update course', 'error');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Course" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="edit-name">Course Name *</Label>
          <Input id="edit-name" {...register('name')} error={errors.name?.message} />
        </div>
        <div>
          <Label htmlFor="edit-description">Description</Label>
          <Textarea id="edit-description" {...register('description')} rows={3} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="edit-category">Category</Label>
            <Input id="edit-category" {...register('category')} />
          </div>
          <div>
            <Label htmlFor="edit-level">Level</Label>
            <Select
              id="edit-level"
              {...register('level')}
              options={levelOptions}
              error={errors.level?.message}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
          <Input id="edit-tags" {...register('tags')} />
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            id="edit-isActive"
            {...register('isActive')}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <Label htmlFor="edit-isActive" className="mb-0 cursor-pointer">
            Course is Active
          </Label>
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" loading={updateCourse.isPending}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
