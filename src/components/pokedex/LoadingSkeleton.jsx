import { Skeleton } from '@/components/ui/skeleton';

export default function LoadingSkeleton({ count = 20 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-card rounded-2xl border border-border overflow-hidden p-4">
          <div className="flex justify-end mb-2">
            <Skeleton className="h-4 w-10" />
          </div>
          <div className="flex justify-center mb-4">
            <Skeleton className="w-24 h-24 rounded-full" />
          </div>
          <Skeleton className="h-5 w-24 mb-2" />
          <div className="flex gap-1.5">
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}