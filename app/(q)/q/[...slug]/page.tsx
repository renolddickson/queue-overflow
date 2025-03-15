import MainContent from "@/app/(q)/q/[...slug]/_components/Content";
import LeftPanel from "@/app/(q)/q/[...slug]/_components/LeftPanel";
import { fetchTopics, fetchBySubTopicId } from "@/actions/document";
import { ApiResponse, ApiSingleResponse, ContentRecord } from "@/types/api";
import MobileSidePanel from "@/components/MobileSidePanel";
import { Suspense } from "react";
import { Topics } from "@/types/api";
import { redirect } from "next/navigation";
import ScrollProgress from "./_components/ScrollProgress";
import { getPrevNextSubtopics } from "@/utils/helper";
import { RouteConfig } from "@/types";

export default async function Page({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  if (!slug || slug.length < 2) {
    redirect('/not-found');
  }

  const [type, docId, subId] = slug;
  if(type !== 'doc' && type !== 'blog')
    redirect('/not-found')
    
  const topicsPromise = fetchTopics(docId);

  if (type=='doc' && !subId) {
    try {
      const topics = await topicsPromise;
      if (
        Array.isArray(topics.data) &&
        topics.data.length > 0 &&
        topics.data[0].subTopics &&
        topics.data[0].subTopics.length > 0
      ) {
        const subtopicId = topics.data[0].subTopics[0].id;
        redirect(`/q/${type}/${docId}/${subtopicId}`);
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error?.code === "NEXT_REDIRECT" || (error?.message && error.message.includes("NEXT_REDIRECT"))) {
        throw error;
      }
      console.error("Error fetching topics:", error);
      return <div>Error loading topics</div>;
    }
  }
  const historyData = getPrevNextSubtopics((await topicsPromise).data,subId)
  const articleId = type === 'doc' ? subId : docId;
  const articlePromise = ( (type =='doc' && subId) || (type=='blog' && docId) )
    ? fetchBySubTopicId<ContentRecord>("contents", "ref_id", articleId)
    : null;
    
  return (
    <div className="w-full flex flex-col">
      {type == 'blog' &&
        <ScrollProgress />
      }
      <div className="w-full flex flex-row">
        {type == 'doc' &&
          <div className="hidden md:block">
            <Suspense fallback={<LeftpanelSkeleton />}>
              <LeftPanelWrapper slug={slug} topicsPromise={topicsPromise} />
            </Suspense>
          </div>
        }
        {articlePromise && (
          <Suspense fallback={<MainContentSkeleton />}>
            <MainContentWrapper articlePromise={articlePromise} type={type} historyData={historyData} />
          </Suspense>
        )}
        {type == 'doc' &&
          <MobileSidePanel>
            <LeftPanelWrapper slug={slug} topicsPromise={topicsPromise} />
          </MobileSidePanel>
        }
      </div>
    </div>
  );
}

// Fallback components remain unchanged
function LeftpanelSkeleton() {
  return (
    <div className="hidden md:block w-64 border-r px-4 py-6 sticky top-16 max-h-fit min-h-[calc(100vh-64px)] bg-gray-100">
      <div className="space-y-4">
        <div className="h-10 w-full bg-gray-300 rounded" />
        <div className="h-6 w-full bg-gray-300 rounded" />
        <div className="h-6 w-full bg-gray-300 rounded" />
        <div className="h-6 w-full bg-gray-300 rounded" />
      </div>
    </div>
  );
}

function MainContentSkeleton() {
  return (
    <div className="flex-1 p-4">
      <div className="mb-4">
        <div className="h-6 w-full bg-gray-300 rounded" />
      </div>
      <div className="space-y-4">
        <div className="h-3 w-10/12 bg-gray-300 rounded" />
        <div className="h-3 w-10/12 bg-gray-300 rounded" />
        <div className="h-3 w-1/2 bg-gray-300 rounded" />
        <div className="h-3 w-1/3 bg-gray-300 rounded" />
      </div>
    </div>
  );
}

// LeftPanelWrapper now awaits its own promise
async function LeftPanelWrapper({
  slug,
  topicsPromise,
}: {
  slug: string[];
  topicsPromise: Promise<ApiResponse<Topics>>;
}) {
  // Wrap the topics fetching in try/catch to handle any potential errors.
  try {
    const topicsResponse = await topicsPromise;
    const topicsData = topicsResponse.data ?? [];
    return (
      <LeftPanel initialPath={`q/${slug.join("/")}`} topics={topicsData} docId={slug[1]} />
    );
  } catch (error) {
    console.error("Error in LeftPanelWrapper:", error);
    return <div>Error loading panel</div>;
  }
}

// MainContentWrapper does the same for the article data
async function MainContentWrapper({
  articlePromise,
  type,
  historyData
}: {
  articlePromise: Promise<ApiSingleResponse<ContentRecord | null>>;
  type: 'doc' | 'blog',
  historyData : RouteConfig
}) {
  // Wrap the article fetching in try/catch to gracefully handle errors.
  try {
    const articleResponse = await articlePromise;
    const articleData = articleResponse?.data;
    return articleData ? <MainContent articleData={articleData} type={type} routeTopic={historyData} /> : <div className="flex justify-center items-center min-h-[calc(100vh-64px)] w-full text-lg font-medium text-gray-500">No content available</div>;
  } catch (error) {
    console.error("Error in MainContentWrapper:", error);
    return <div>Error loading content</div>;
  }
}
