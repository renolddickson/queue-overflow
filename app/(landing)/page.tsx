import { getUser } from "@/actions/auth";
import { redirect } from "next/navigation";
import Hero from "./_components/Hero";
import Trust from "./_components/Trust";
import Features from "./_components/Features";
import Showcase from "./_components/Showcase";
import CTA from "./_components/CTA";

export const revalidate = 0;

export default async function LandingPage() {
  const user = await getUser();

  if (user) {
    redirect("/feed");
  }

  return (
    <div className="flex flex-col bg-white dark:bg-background text-slate-900 dark:text-slate-50 overflow-hidden">
      <Hero />
      {/* <Trust /> */}
      {/* <Features /> */}
      <Showcase />
      <CTA />
    </div>
  );
}
