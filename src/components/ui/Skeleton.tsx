interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

export function Skeleton({ className = '', variant = 'rectangular' }: SkeletonProps) {
  const variantStyles = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <div
      className={`animate-pulse bg-gray-200 ${variantStyles[variant]} ${className}`}
      aria-hidden="true"
      role="status"
      aria-label="Loading"
    />
  );
}

// Pre-built Skeleton combinations
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="flex items-start gap-4 mb-4">
        <Skeleton variant="circular" className="w-12 h-12 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="w-3/4" />
          <Skeleton variant="text" className="w-1/2" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Skeleton variant="rectangular" className="h-16" />
        <Skeleton variant="rectangular" className="h-16" />
      </div>
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton variant="rectangular" className="w-16 h-10" />
          <Skeleton variant="text" className="flex-1 h-10" />
          <Skeleton variant="text" className="w-24 h-10" />
        </div>
      ))}
    </div>
  );
}
