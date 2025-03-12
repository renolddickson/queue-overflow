import MainContent from "@/app/q/view/[...slug]/_components/Content";
import LeftPanel from "@/app/q/view/[...slug]/_components/LeftPanel";
import { fetchTopics, fetchBySubTopicId } from "@/actions/document";
import { ApiResponse, ApiSingleResponse, ContentRecord } from "@/types/api";
import MobileSidePanel from "@/components/MobileSidePanel";
import { Suspense } from "react";
import { Topics } from "@/types";
import { redirect } from "next/navigation";

// Notice that Page is now a synchronous server component
export default async function Page({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  // Start the data fetching but do not await—pass the promises down!
  const topicsPromise = fetchTopics(slug[0]);

  if (!slug[1]) {
    const topics = await topicsPromise;
    // Check that the data structure exists and there is at least one subtopic
    if (topics.data && topics.data[0].subTopics && topics.data[0].subTopics.length > 0) {
      const subtopicId = topics.data[0].subTopics[0].id;
      // Redirect to the route including the subtopic
      redirect(`/q/view/${slug[0]}/${subtopicId}`);
    }
  }
  const articlePromise = slug[1]
  ? fetchBySubTopicId<ContentRecord>("contents", "subtopic_id", slug[1])
  : null;
  return (
    <>
      <div className="hidden md:block">
        <Suspense fallback={<LeftpanelSkeleton />}>
          <LeftPanelWrapper slug={slug} topicsPromise={topicsPromise} />
        </Suspense>
      </div>
      {articlePromise && (
        <Suspense fallback={<MainContentSkeleton />}>
          <MainContentWrapper articlePromise={articlePromise} />
        </Suspense>
      )}
      <MobileSidePanel>
        <LeftPanelWrapper slug={slug} topicsPromise={topicsPromise} />
      </MobileSidePanel>
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
      <div className="h-12 w-full bg-gray-300 rounded mb-4" />
      <div className="space-y-4">
        <div className="h-6 w-full bg-gray-300 rounded" />
        <div className="h-6 w-full bg-gray-300 rounded" />
        <div className="h-6 w-full bg-gray-300 rounded" />
        <div className="h-6 w-full bg-gray-300 rounded" />
        <div className="h-6 w-full bg-gray-300 rounded" />
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
    <LeftPanel initialPath={`q/view/${slug.join("/")}`} topics={topicsData} docId={slug[0]} />
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
  return articleData ? <MainContent articleData={articleData} /> : <div className="flex justify-center items-center min-h-screen">No content available</div>;
}
