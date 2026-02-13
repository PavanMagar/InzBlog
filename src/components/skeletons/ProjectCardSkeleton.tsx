import { Skeleton } from "@/components/ui/skeleton";

export function ProjectCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card p-5">
      <Skeleton className="mb-4 aspect-[16/10] w-full rounded-xl" />
      <div className="flex gap-1.5 mb-3">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-5 w-4/5 mb-2" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-2/3 mb-4" />
      <div className="pt-3 border-t border-border/50">
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}
