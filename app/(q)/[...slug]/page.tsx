import MainContent from "@/components/common/Content";
import LeftPanel from "./_components/LeftPanel";
import { fetchTopics, fetchBySubTopicId, fetchData } from "@/actions/document";
import { ApiResponse, ApiSingleResponse, ContentRecord, Topics, DocumentData } from "@/types/api";
import MobileSidePanel from "@/components/MobileSidePanel";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import ScrollProgress from "./_components/ScrollProgress";
import { getPrevNextSubtopics } from "@/utils/helper";
import { RouteConfig } from "@/types";
import GoToTop from "./_components/GoToTop";

export default async function Page({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  if (!slug || slug.length < 2) {
    redirect('/not-found');
  }

  // Unified Route Structure: /[prefix]/[docId]/[optionalSubId]
  // The 'prefix' (typeInUrl) is usually 'doc' now for everything.
  const [typeInUrl, docId, subId] = slug;
  
  // 1. Fetch document metadata to find the real internal type
  const { data: docs } = await fetchData<DocumentData>({
    table: "documents",
    filter: { id: docId }
  });
console.log({docs});

  const document = docs?.[0];
  if (!document) {
    redirect('/not-found');
  }

  // The 'actualType' determines the UX/Layout (LeftPanel vs TableOfContents)
  const actualType = document.type; // 'doc' or 'blog'

  // 2. Handle redirection for blogs if subId is missing
  const topicsPromise = fetchTopics(docId);
  if (actualType === 'blog' && !subId) {
    try {
      const topics = await topicsPromise;
      if (
        Array.isArray(topics.data) &&
        topics.data.length > 0 &&
        topics.data[0].subTopics &&
        topics.data[0].subTopics.length > 0
      ) {
        const firstSubtopicId = topics.data[0].subTopics[0].id;
        // Redirect within the same prefix used (usually /doc/ or /blog/)
        redirect(`/${typeInUrl}/${docId}/${firstSubtopicId}`);
      }
    } catch (error: any) {
      if (error?.code === "NEXT_REDIRECT" || (error?.message && error.message.includes("NEXT_REDIRECT"))) {
        throw error;
      }
      console.error("Error fetching topics:", error);
      return <div className="p-8 text-center">Error loading document structure</div>;
    }
  }

  // 3. Prepare data for rendering
  const historyData = getPrevNextSubtopics((await topicsPromise).data || [], subId);
  const contentReferenceId = actualType === 'blog' ? subId : docId;
  
  const articlePromise = contentReferenceId 
    ? fetchBySubTopicId<ContentRecord>("contents", "ref_id", contentReferenceId)
    : null;

  return (
    <div className="relative w-full flex flex-col">
      {actualType === 'doc' && <ScrollProgress />}
      {actualType === 'doc' && <GoToTop />}
      
      <div className="w-full flex flex-row">
        {actualType === 'blog' && (
          <div className="hidden md:block">
            <Suspense fallback={<LeftpanelSkeleton />}>
              <LeftPanelWrapper slug={slug} topicsPromise={topicsPromise} />
            </Suspense>
          </div>
        )}
        
        {articlePromise && (
          <Suspense fallback={<MainContentSkeleton type={actualType} />}>
            <MainContentWrapper 
              articlePromise={articlePromise} 
              type={actualType} 
              historyData={historyData} 
            />
          </Suspense>
        )}
        
        {actualType === 'blog' && (
          <MobileSidePanel>
            <LeftPanelWrapper slug={slug} topicsPromise={topicsPromise} />
          </MobileSidePanel>
        )}
      </div>
    </div>
  );
}

// Fallback components with modern aesthetics
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

function MainContentSkeleton({ type }: { type: string }) {
  return (
    <div className={`flex-1 p-8 md:p-12 ${type === 'blog' ? 'max-w-6xl mx-auto' : 'w-full'}`}>
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

async function LeftPanelWrapper({
  slug,
  topicsPromise,
}: {
  slug: string[];
  topicsPromise: Promise<ApiResponse<Topics>>;
}) {
  try {
    const topicsResponse = await topicsPromise;
    const topicsData = topicsResponse.data ?? [];
    return (
      <LeftPanel initialPath={`${slug.join("/")}`} topics={topicsData} docId={slug[1]} />
    );
  } catch (error) {
    console.error("Error in LeftPanelWrapper:", error);
    return <div className="p-4 text-slate-400">Structure unavailable</div>;
  }
}

async function MainContentWrapper({
  articlePromise,
  type,
  historyData
}: {
  articlePromise: Promise<ApiSingleResponse<ContentRecord | null>>;
  type: 'doc' | 'blog',
  historyData : RouteConfig
}) {
  try {
    const articleResponse = await articlePromise;
    const articleData = articleResponse?.data;
    return articleData ? (
      <MainContent articleData={articleData} type={type} routeTopic={historyData} />
    ) : (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full text-slate-500">
        <div className="text-xl font-serif italic text-center px-6">
          This section is currently being written or is not available.
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in MainContentWrapper:", error);
    return <div className="p-8 text-center text-red-500">Error loading content</div>;
  }
}
