import { Skeleton } from "@/components/ui/skeleton";
import { PublicHeader } from "@/components/PublicHeader";

export function PostDetailSkeleton() {
  return (
    <>
      <PublicHeader />
      <div className="pt-20 md:pt-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col items-center text-center py-10 md:py-16">
            <Skeleton className="h-8 w-28 rounded-full mb-6" />
            <div className="flex gap-2 mb-5">
              <Skeleton className="h-6 w-16 rounded-md" />
              <Skeleton className="h-6 w-20 rounded-md" />
            </div>
            <Skeleton className="h-12 w-4/5 max-w-3xl mb-3" />
            <Skeleton className="h-10 w-3/5 max-w-2xl mb-6" />
            <Skeleton className="h-5 w-72 max-w-full mb-6" />
            <Skeleton className="h-10 w-56 rounded-full" />
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
