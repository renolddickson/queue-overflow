import MainContent from "@/components/common/Content";
import LeftPanel from "./_components/LeftPanel";
import { fetchTopics, fetchContentByRef, fetchData } from "@/actions/document";
import { ApiResponse, ApiSingleResponse, ContentRecord, Topics, DocumentData } from "@/types/api";
import MobileSidePanel from "@/components/MobileSidePanel";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import ScrollProgress from "./_components/ScrollProgress";
import { getPrevNextSubtopics } from "@/utils/helper";
import { RouteConfig } from "@/types";
import GoToTop from "../_components/GoToTop";

export default async function Page({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  if (!slug || slug.length < 2) {
    notFound();
  }

  // Unified Route Structure: /[prefix]/[docId]/[optionalSubId]
  // The 'prefix' (typeInUrl) is usually 'posts' or 'docs' now.
  const [typeInUrl, docId, subId] = slug;

  // 1. Fetch document metadata with user info
  const { data: docs } = await fetchData<any>({
    table: "documents",
    filter: { id: docId },
    select: `*, user:users!inner(id, user_name, profile_image, display_name)`
  });

  const document = docs?.[0];
  if (!document) {
    notFound();
  }

  // Supabase join can sometimes return an array for 1-1 joins if not typed strictly
  // We check both 'user' and 'users' as relationship names can vary
  const rawUser = document.user || (document as any).users;
  const authorData = Array.isArray(rawUser) ? rawUser[0] : rawUser;

  const actualType = document.type; // 'docs' or 'posts'

  // 2. Logic branching based on document type
  let topicsPromise: Promise<ApiResponse<Topics>> | null = null;
  let historyData: RouteConfig | null = null;
  let contentReferenceId = docId;

  if (actualType === 'docs') {
    // Multi-page documentation needs topics and subtopic navigation
    topicsPromise = fetchTopics(docId);

    // Handle redirection if subId is missing for multi-page docs
    if (!subId) {
      try {
        const topics = await topicsPromise;
        if (topics.data?.[0]?.subTopics?.[0]) {
          const firstSubtopicId = topics.data[0].subTopics[0].id;
          redirect(`/${typeInUrl}/${docId}/${firstSubtopicId}`);
        }
      } catch (error: any) {
        if (error?.code === "NEXT_REDIRECT" || error?.message?.includes("NEXT_REDIRECT")) {
          throw error;
        }
        console.error("Error fetching topics:", error);
        return <div className="p-8 text-center">Error loading document structure</div>;
      }
    }

    historyData = getPrevNextSubtopics((await topicsPromise).data || [], subId);
    contentReferenceId = subId;
  } else {
    // Single page posts use docId directly for content
    contentReferenceId = docId;
  }

  // 3. Fetch the actual content
  const articlePromise = fetchContentByRef(actualType as any, contentReferenceId);

  return (
    <div className="relative w-full flex flex-col">
      <>
        <ScrollProgress />
        <GoToTop />
      </>

      <div className="w-full flex flex-row">
        {actualType === 'docs' && topicsPromise && (
          <div className="hidden md:block">
            <Suspense fallback={<LeftpanelSkeleton />}>
              <LeftPanelWrapper slug={slug} topicsPromise={topicsPromise} />
            </Suspense>
          </div>
        )}

        <Suspense fallback={<MainContentSkeleton type={actualType} />}>
          <MainContentWrapper
            articlePromise={articlePromise}
            type={actualType as any}
            historyData={historyData as RouteConfig}
            docId={docId}
            author={authorData}
          />
        </Suspense>

        {actualType === 'docs' && topicsPromise && (
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
    <div className={`flex-1 p-8 md:p-12 ${type === 'docs' ? 'max-w-6xl mx-auto' : 'w-full'}`}>
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
  historyData,
  docId, // Add docId to handle fallback
  author
}: {
  articlePromise: Promise<ApiSingleResponse<ContentRecord | null>>;
  type: 'posts' | 'docs',
  historyData: RouteConfig,
  docId: string,
  author?: any
}) {
  try {
    let articleResponse = await articlePromise;
    let articleData = articleResponse?.data;
 
    return articleData ? (
      <MainContent articleData={articleData} type={type} routeTopic={historyData} author={author} />
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
