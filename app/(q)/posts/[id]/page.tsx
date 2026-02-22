import MainContent from "@/components/common/Content";
import { getDetailedDocument } from "@/actions/document";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import ScrollProgress from "../../_components/ScrollProgress";
import GoToTop from "../../_components/GoToTop";

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { document, articleData, error, type } = await getDetailedDocument(id);
  console.log(document, articleData, error, type);
  if (error || !document || type !== 'posts') {
    notFound();
  }

  const authorData = Array.isArray(document.user) ? document.user[0] : document.user;

  return (
    <div className="relative w-full flex flex-col">
      <ScrollProgress />
      <GoToTop />

      <div className="w-full flex flex-row">
        <Suspense fallback={<MainContentSkeleton />}>
          <MainContent articleData={articleData} type="posts" routeTopic={null as any} author={authorData} />
        </Suspense>
      </div>
    </div>
  );
}

function MainContentSkeleton() {
  return (
    <div className="flex-1 p-8 md:p-12 w-full">
      <div className="mb-8 space-y-4">
        <div className="h-12 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
        <div className="h-4 w-1/4 bg-slate-100 dark:bg-slate-800/50 rounded-lg animate-pulse" />
      </div>
      <div className="space-y-8">
        <div className="h-6 w-full bg-slate-100 dark:bg-slate-800/50 rounded-lg animate-pulse" />
        <div className="h-64 w-full bg-slate-100 dark:bg-slate-800/50 rounded-3xl animate-pulse" />
        <div className="h-6 w-11/12 bg-slate-100 dark:bg-slate-800/50 rounded-lg animate-pulse" />
        <div className="h-4 w-10/12 bg-slate-100 dark:bg-slate-800/50 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}
