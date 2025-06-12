import { InboxIcon, PlusIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  className?: string;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  className,
  title = 'No data found',
  description = 'There are no items to display at this time.',
  icon = <InboxIcon size={48} />,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-muted-foreground gap-4',
        'min-h-[300px] border border-dashed rounded-lg border-muted-foreground/20',
        className,
      )}
    >
      <div className='text-muted-foreground/60'>{icon}</div>
      <h3 className='text-lg font-medium'>{title}</h3>
      <p className='text-center max-w-md text-sm'>{description}</p>
      {actionLabel && onAction && (
        <Button variant='outline' className='mt-2 gap-2' onClick={onAction}>
          <PlusIcon size={16} />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
