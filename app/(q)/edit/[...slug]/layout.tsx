import { checkPermission } from "@/actions/auth";
import { getDetailedDocument } from "@/actions/document";
import { redirect } from "next/navigation";
import EditorLayoutClient from "./_components/EditorLayoutClient";
import { DesktopOnly } from "@/components/shared/DesktopOnly";

export default async function EditorLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const [type, docId] = slug;

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!docId || !uuidRegex.test(docId)) {
    redirect('/not-found');
  }

  const isAuthorized = await checkPermission('documents', docId);
  if (!isAuthorized) {
    redirect('/not-authorized');
  }

  const { topics, error } = await getDetailedDocument(docId);

  if (error) {
    redirect('/not-authorized');
  }

  // Handle redirection if subId is missing for multi-page docs
  const subId = slug[2];
  if (type === 'docs' && !subId) {
    if (topics?.[0]?.subTopics?.[0]) {
      redirect(`/edit/docs/${docId}/${topics[0].subTopics[0].id}`);
    } else if (topics?.[0]) {
      redirect(`/edit/docs/${docId}/${topics[0].id}`);
    }
  }

  return (
    <DesktopOnly>
      <EditorLayoutClient type={type} docId={docId} initialTopics={topics}>
        {children}
      </EditorLayoutClient>
    </DesktopOnly>
  );
}
