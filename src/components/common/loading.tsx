import { FadeLoader } from 'react-spinners';
import { cn } from '@/lib/utils';

interface LoadingProps {
  className?: string;
  size?: number;
  color?: string;
  fullScreen?: boolean;
}

export function Loading({
  className,
  size = 15,
  color = 'var(--primary)',
  fullScreen = false,
}: LoadingProps) {
  const containerClass = cn(
    'flex justify-center items-center h-full',
    fullScreen ? 'fixed inset-0 bg-background/80 backdrop-blur-sm z-50' : 'p-8',
    className,
  );

  return (
    <div className={containerClass}>
      <FadeLoader
        color={color}
        height={size}
        width={size / 4}
        radius={2}
        margin={2}
        aria-label='Loading'
      />
    </div>
  );
}

export function PageLoading() {
  return <Loading fullScreen={false} color='var(--kidguard-teal)' />;
}

export function FullScreenLoading() {
  return <Loading fullScreen={true} color='var(--kidguard-teal)' />;
}
