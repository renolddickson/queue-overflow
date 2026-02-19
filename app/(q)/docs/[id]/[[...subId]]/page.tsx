import MainContent from "@/components/common/Content";
import LeftPanel from "../../../_components/LeftPanel";
import { getDetailedDocument } from "@/actions/document";
import MobileSidePanel from "@/components/MobileSidePanel";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getPrevNextSubtopics } from "@/utils/helper";
import { RouteConfig } from "@/types";

export default async function DocsPage({ 
  params 
}: { 
  params: Promise<{ id: string; subId?: string[] }> 
}) {
  const { id, subId } = await params;
  const subtopicId = subId?.[0]; // [[...subId]] gives an array

  const { document, topics, articleData, type, error } = await getDetailedDocument(id, subtopicId);


  if (error || !document || type !== 'docs') {
    notFound();
  }

  // If no subId provided and we have a first subtopic, we can either redirect or just serve it.
  // Serving it immediately is faster, but for SEO/URL consistency, a redirect is often preferred.
  // HOWEVER, the user asked for optimization ("make faster like this optimise everywhere").
  // So I will serve it immediately if possible, or redirect if needed.
  if (!subtopicId && topics.length > 0) {
      redirect(`/docs/${id}/${topics[0].id}`);
  }


  const historyData = getPrevNextSubtopics(topics, subtopicId || "");

  return (
    <div className="relative w-full flex flex-col">
      <div className="w-full flex flex-row">
        <div className="hidden md:block">
          <Suspense fallback={<LeftpanelSkeleton />}>
             <LeftPanel 
                initialPath={`docs/${id}/${subtopicId || ""}`} 
                topics={topics} 
                docId={id} 
              />
          </Suspense>
        </div>

        <Suspense fallback={<MainContentSkeleton />}>
          <MainContent 
            articleData={articleData} 
            type="docs" 
            routeTopic={historyData as RouteConfig} 
          />
        </Suspense>

        <MobileSidePanel>
           <LeftPanel 
              initialPath={`docs/${id}/${subtopicId || ""}`} 
              topics={topics} 
              docId={id} 
            />
        </MobileSidePanel>
      </div>
    </div>
  );
}

function LeftpanelSkeleton() {
  return (
    <div className="hidden md:block w-64 border-r px-4 py-6 sticky top-16 max-h-fit min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900/50">
      <div className="space-y-4">
        <div className="h-10 w-full bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        <div className="h-6 w-full bg-slate-100 dark:bg-slate-800/50 rounded-lg animate-pulse" />
        <div className="h-6 w-full bg-slate-100 dark:bg-slate-800/50 rounded-lg animate-pulse" />
        <div className="h-6 w-full bg-slate-100 dark:bg-slate-800/50 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}

function MainContentSkeleton() {
  return (
    <div className="flex-1 p-8 md:p-12 max-w-6xl mx-auto">
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
