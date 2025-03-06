import MainContent from "@/app/q/view/[...slug]/_components/Content";
import LeftPanel from "@/app/q/view/[...slug]/_components/LeftPanel";
import { fetchTopics, fetchBySubTopicId } from "@/actions/document"; // adjust the import path as needed
import { ContentRecord } from "@/types/api";

export default async function Page({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const topicsResponse = await fetchTopics(slug[0]);
  const topicsData = topicsResponse.data ?? [];
  const articleResponse = slug[1] ? await fetchBySubTopicId<ContentRecord>('contents', 'subtopic_id', slug[1]) : null;
  const articleData = articleResponse?.data;

  return (
    <>
      <div className="hidden md:block">
        <LeftPanel initialPath={`q/view/${slug.join("/")}`} topics={topicsData} docId={slug[0]}/>
      </div>
      {articleData && 
      <MainContent articleData={articleData} />
      }
    </>
  );
}
