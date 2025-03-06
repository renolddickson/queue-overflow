import { EditorClient } from "./_components/EditorClient";

export default async function Page({ params }: { params: { slug: string[] } }) {
  const {slug} = await params
  // The server component gets the slug from params
  return <EditorClient slug={slug} />;
}