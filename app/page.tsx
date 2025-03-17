import { LandingHeader } from "./_components/LandingHeader"
import { Hero } from "./_components/Hero"
import { Github, Twitter, Youtube } from "lucide-react";
// import { LandingFooter } from "./_components/LandingFooter"

export const revalidate = 0;
export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
    <LandingHeader />
    <Hero />
    {/* <LandingFooter /> */}
    <footer className="bg-white border-t border-gray-300 py-4">
      <div className="container mx-auto px-4 text-center">
        <p className="text-gray-600 text-sm mb-2">
          Made with <span className="text-red-500">❤️</span> from India
        </p>
        <div className="flex justify-center space-x-2 text-white">
          <a 
            href="https://github.com/yourusername"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="footer-icon"
          >
            <Github size={12} />
          </a>
          <a 
            href="https://youtube.com/yourchannel"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
            className="footer-icon"
          >
            <Youtube size={12} />
          </a>
          <a 
            href="https://twitter.com/yourusername"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
            className="footer-icon"
          >
            <Twitter size={12} />
          </a>
        </div>
      </div>
    </footer>
    </div>
  )
}

