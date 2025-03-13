import MainContent from "@/app/(q)/q/[...slug]/_components/Content";
import LeftPanel from "@/app/(q)/q/[...slug]/_components/LeftPanel";
import { fetchTopics, fetchBySubTopicId } from "@/actions/document";
import { ApiResponse, ApiSingleResponse, ContentRecord } from "@/types/api";
import MobileSidePanel from "@/components/MobileSidePanel";
import { Suspense } from "react";
import { Topics } from "@/types/api";
import { redirect } from "next/navigation";

// Notice that Page is now a synchronous server component
export default async function Page({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const [type,docId,subId] = slug;
  // Start the data fetching but do not await—pass the promises down!
  const topicsPromise = fetchTopics(docId);

  if (!subId) {
    const topics = await topicsPromise;
    // Check that the data structure exists and there is at least one subtopic
    if (topics.data && topics.data[0].subTopics && topics.data[0].subTopics.length > 0) {
      const subtopicId = topics.data[0].subTopics[0].id;
      // Redirect to the route including the subtopic
      redirect(`/q/${type}/${docId}/${subtopicId}`);
    }
  }
  const articlePromise = subId
  ? fetchBySubTopicId<ContentRecord>("contents", "subtopic_id", type == 'doc'?subId:docId)
  : null;
  return (
    <>
    {type == 'doc' &&
      <div className="hidden md:block">
        <Suspense fallback={<LeftpanelSkeleton />}>
          <LeftPanelWrapper slug={slug} topicsPromise={topicsPromise} />
        </Suspense>
      </div>
      }
      {articlePromise && (
        <Suspense fallback={<MainContentSkeleton />}>
          <MainContentWrapper articlePromise={articlePromise} />
        </Suspense>
      )}
      {type == 'doc' &&
      <MobileSidePanel>
        <LeftPanelWrapper slug={slug} topicsPromise={topicsPromise} />
      </MobileSidePanel>
      }
    </>
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
  const topicsResponse = await topicsPromise;
  const topicsData = topicsResponse.data ?? [];
  return (
    <LeftPanel initialPath={`q/${slug.join("/")}`} topics={topicsData} docId={slug[1]} />
  );
}

// MainContentWrapper does the same for the article data
async function MainContentWrapper({
  articlePromise,
}: {
  articlePromise: Promise<ApiSingleResponse<ContentRecord | null>>;
}) {
  const articleResponse = await articlePromise;
  const articleData = articleResponse?.data;
  return articleData ? <MainContent articleData={articleData} /> : <div className="flex justify-center items-center min-h-[calc(100vh-64px)] w-full text-lg font-medium text-gray-500">No content available</div>;
}
