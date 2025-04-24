import { ArrowRight } from "lucide-react";
import Link from "next/link";

const CallToAction = () => {
  return (
    <section id="how-it-works" className="py-16 md:py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-8 md:p-12 shadow-xl text-white text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Start Creating Today</h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands of content creators and documentation writers using WriteVerse to share knowledge with the world.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-8 text-left">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
                <div className="text-4xl font-bold mb-2">1</div>
                <h3 className="text-xl font-semibold mb-2">Create</h3>
                <p className="opacity-90">Build blogs or multi-page documents with our intuitive editor</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
                <div className="text-4xl font-bold mb-2">2</div>
                <h3 className="text-xl font-semibold mb-2">Customize</h3>
                <p className="opacity-90">Add images, videos, code blocks, and custom formatting</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
                <div className="text-4xl font-bold mb-2">3</div>
                <h3 className="text-xl font-semibold mb-2">Share</h3>
                <p className="opacity-90">Publish and share your content with your audience</p>
              </div>
            </div>
            <Link href="/auth">
            <button 
              className="px-6 py-3 text-lg bg-white text-blue-600 hover:bg-white/90 hover:text-blue-700 rounded-lg font-medium inline-flex items-center group"
              >
              Get Started for Free
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
            </button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Background Elements */}
      <div className="absolute top-1/4 left-0 w-64 h-64 bg-blue-200/30 rounded-full -translate-x-1/2"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-200/30 rounded-full translate-x-1/3 translate-y-1/3"></div>
    </section>
  );
};

export default CallToAction;