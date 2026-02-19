import { redirect } from "next/navigation";
import { EditorClient } from "./_components/EditorClient";
import { checkPermission } from "@/actions/auth";
import { fetchTopics } from "@/actions/document";

export default async function Page({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  const [type, docId, subId] = slug;

  if (type !== 'posts' && type !== 'docs') {
    redirect('/not-found')
  }

  const isAuthorized = await checkPermission('documents', docId);
  if (!isAuthorized) {
    redirect('/not-authorized');
  }

  // Handle redirection if subId is missing for multi-page docs
  if (type === 'docs' && !subId) {
    const topicsRes = await fetchTopics(docId);
    if (topicsRes.data?.[0]) {
      redirect(`/edit/docs/${docId}/${topicsRes.data[0].id}`);
    }
  }


  // The server component gets the slug from params
  return <EditorClient slug={slug} />;
}