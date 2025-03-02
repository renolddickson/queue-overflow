import MainContent from "@/components/Content"
import LeftPanel from "@/components/LeftPanel";

export default async function Page({params}:{params:Promise<{slug:string[]}>}) {
  const {slug} = await params
  console.log(slug);
  return (
    <>
      <div className="hidden md:block">
        <LeftPanel />
      </div>
    <MainContent />
    </>
  )
}

