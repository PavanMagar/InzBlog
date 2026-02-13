import { Skeleton } from "@/components/ui/skeleton";
import { PublicHeader } from "@/components/PublicHeader";

export function PostDetailSkeleton() {
  return (
    <>
      <PublicHeader />
      <div className="pt-24 md:pt-32 pb-8 md:pb-12" style={{ background: "var(--gradient-hero)" }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex gap-2 mb-5">
            <Skeleton className="h-6 w-20 rounded-full bg-white/10" />
            <Skeleton className="h-6 w-24 rounded-full bg-white/10" />
          </div>
          <Skeleton className="h-10 w-4/5 mb-3 bg-white/10" />
          <Skeleton className="h-8 w-3/5 mb-6 bg-white/10" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-32 bg-white/10" />
            <Skeleton className="h-4 w-24 bg-white/10" />
            <Skeleton className="h-4 w-20 bg-white/10" />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 md:py-10">
        <div className="lg:flex lg:gap-10 xl:gap-14">
          <div className="min-w-0 flex-1 lg:max-w-3xl space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-48 w-full rounded-xl mt-4" />
            <Skeleton className="h-4 w-full mt-4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-full mt-4" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <aside className="hidden lg:block lg:w-80 xl:w-96">
            <div className="sticky top-24 space-y-6">
              <Skeleton className="h-32 w-full rounded-2xl" />
              <Skeleton className="h-48 w-full rounded-2xl" />
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
