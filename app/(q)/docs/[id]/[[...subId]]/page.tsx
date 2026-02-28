import MainContent from "@/components/common/Content";
import LeftPanel from "../../../_components/LeftPanel";
import { getDetailedDocument } from "@/actions/document";
import MobileSidePanel from "@/components/MobileSidePanel";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getPrevNextSubtopics } from "@/utils/helper";
import { RouteConfig } from "@/types";
import { AnalyticsTracker } from "@/components/shared/AnalyticsTracker";

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

  if (!subtopicId && topics.length > 0) {
      // Redirect to the first root topic instead of the first subtopic
      redirect(`/docs/${id}/${topics[0].id}`);
  }


  const historyData = getPrevNextSubtopics(topics, subtopicId || "");

  return (
    <div className="relative w-full flex flex-col bg-white dark:bg-background min-h-screen">
      <AnalyticsTracker documentId={id} />
      <div className="w-full flex flex-row">
        {/* Navigation Sidebar */}
        <aside className="hidden md:block w-64 shrink-0">
          <Suspense fallback={<LeftpanelSkeleton />}>
             <LeftPanel 
                initialPath={`docs/${id}/${subtopicId || ""}`} 
                topics={topics} 
                docId={id} 
              />
          </Suspense>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 px-6 py-12 md:px-12 md:py-16">
          <Suspense fallback={<MainContentSkeleton />}>
              <MainContent 
                articleData={articleData} 
                type="docs" 
                routeTopic={historyData as RouteConfig} 
                author={document.user}
              />
          </Suspense>
        </main>

        {/* Mobile Navigation */}
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
    <div className="hidden md:block w-64 border-r px-4 py-6 sticky top-16 max-h-fit min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-zinc-900/50">
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
