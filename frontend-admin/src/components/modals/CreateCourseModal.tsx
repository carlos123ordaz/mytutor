import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { useCreateCourse } from '../../hooks/useCourses';
import { useToast } from '../ui/Toast';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'all_levels']),
  tags: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const levelOptions = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'all_levels', label: 'All Levels' },
];

interface CreateCourseModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateCourseModal({ open, onClose }: CreateCourseModalProps) {
  const createCourse = useCreateCourse();
  const toast = useToast();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { level: 'all_levels' },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createCourse.mutateAsync({
        ...data,
        tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      });
      toast('Course created successfully!', 'success');
      reset();
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast(error?.response?.data?.message ?? 'Failed to create course', 'error');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Create New Course" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="name">Course Name *</Label>
          <Input id="name" {...register('name')} error={errors.name?.message} placeholder="e.g. Introduction to Python" />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" {...register('description')} rows={3} placeholder="Course description..." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <Input id="category" {...register('category')} placeholder="e.g. Programming" />
          </div>
          <div>
            <Label htmlFor="level">Level</Label>
            <Select
              id="level"
              {...register('level')}
              options={levelOptions}
              error={errors.level?.message}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input id="tags" {...register('tags')} placeholder="python, beginner, programming" />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" loading={createCourse.isPending}>
            Create Course
          </Button>
        </div>
      </form>
    </Modal>
  );
}
