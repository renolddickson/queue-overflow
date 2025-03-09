import { LandingHeader } from "./q/_components/LandingHeader"
import { Hero } from "./q/_components/Hero"
import { LandingFooter } from "./q/_components/LandingFooter"

export const revalidate = 0;
export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
    <LandingHeader />
    <Hero />
    <LandingFooter />
    </div>
  )
}

