import { redirect } from "next/navigation";
import { EditorClient } from "./_components/EditorClient";

export default async function Page({ params }: { params:  Promise<{ slug: string[] }> }) {
  const {slug} = await params
  if(slug[0]!=='doc' && slug[0]!=='blog'){
    redirect('/not-found')
  }
  // The server component gets the slug from params
  return <EditorClient slug={slug} />;
}