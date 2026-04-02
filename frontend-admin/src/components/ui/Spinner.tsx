import { cn } from '../../lib/utils';

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin',
        className
      )}
    />
  );
}

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <Spinner className="text-blue-600 w-8 h-8" />
    </div>
  );
}
