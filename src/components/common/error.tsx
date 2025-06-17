import { AlertCircleIcon, RefreshCwIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

interface ErrorProps {
  className?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorMessage({
  className,
  message = 'An error occurred. Please try again.',
  onRetry,
}: ErrorProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-destructive gap-4',
        className,
      )}
    >
      <AlertCircleIcon size={36} />
      <p className='text-center'>{message}</p>
      {onRetry && (
        <Button variant='outline' className='mt-2 gap-2' onClick={onRetry}>
          <RefreshCwIcon size={16} />
          Retry
        </Button>
      )}
    </div>
  );
}
