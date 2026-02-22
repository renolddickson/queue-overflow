import { redirect } from "next/navigation";
import { EditorClient } from "./_components/EditorClient";
import { checkPermission } from "@/actions/auth";
import { getDetailedDocument } from "@/actions/document";

export default async function Page({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  const [type, docId, subId] = slug;
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(docId)) {
    redirect('/not-found')
  }

  if (type !== 'posts' && type !== 'docs') {
    redirect('/not-found')
  }

  const isAuthorized = await checkPermission('documents', docId);
  if (!isAuthorized) {
    redirect('/not-authorized');
  }

  const { document, topics, error } = await getDetailedDocument(docId, subId);

  if (error || !document) {
    redirect('/not-authorized');
  }

  // Handle redirection if subId is missing for multi-page docs
  if (type === 'docs' && !subId) {
    if (topics?.[0]?.subTopics?.[0]) {
      redirect(`/edit/docs/${docId}/${topics[0].subTopics[0].id}`);
    } else if (topics?.[0]) {
        redirect(`/edit/docs/${docId}/${topics[0].id}`);
    }
  }

  return <EditorClient slug={slug} initialDoc={document} />;
}