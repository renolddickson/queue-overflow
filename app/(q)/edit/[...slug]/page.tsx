import { redirect } from "next/navigation";
import { EditorClient } from "./_components/EditorClient";
import { checkPermission } from "@/actions/auth";

export default async function Page({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  const [type, docId] = slug;

  if (type !== 'posts' && type !== 'docs') {
    redirect('/not-found')
  }

  const isAuthorized = await checkPermission('documents', docId);
  if (!isAuthorized) {
    redirect('/not-authorized');
  }

  // The server component gets the slug from params
  return <EditorClient slug={slug} />;
}