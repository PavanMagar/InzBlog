import { Skeleton } from "@/components/ui/skeleton";

interface PostCardSkeletonProps {
  compact?: boolean;
}

export function PostCardSkeleton({ compact }: PostCardSkeletonProps) {
  if (compact) {
    return (
      <div className="flex gap-3 rounded-xl border border-border bg-card p-3">
        <Skeleton className="h-16 w-20 shrink-0 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <Skeleton className="aspect-[16/9] w-full" />
      <div className="flex flex-1 flex-col p-5 space-y-3">
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-border/50">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}
