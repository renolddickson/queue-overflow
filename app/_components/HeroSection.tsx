import { ArrowRight, BookOpen, Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
    const sampleCode = {
        config: {
            language: 'js',
        },
        data: `// Initialize WriteVerse
initDocs({
  name: "knowledge-base",
  theme: "modern-dark",
  output: "./docs",
})

// Build and publish
buildAndDeploy()`
    }
    return (
        <section className="py-20 md:py-28">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                        Now in v2.0 - More Powerful Than Ever
                    </div>
                    
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
                        The Future of <br />
                        <span className="text-primary">Team Knowledge</span>
                    </h1>
                    
                    <p className="text-xl text-gray-600 max-w-2xl">
                        WriteVerse empowers teams to create, collaborate, and publish beautiful documentation and internal blogs in seconds. No more fragmented knowledge.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link href="/feed">
                            <Button size="lg" className="px-8 font-semibold">
                                Get Started for Free
                                <ArrowRight size={18} className="ml-2" />
                            </Button>
                        </Link>
                        <Link href="#showcase">
                            <Button variant="outline" size="lg" className="px-8 font-semibold">
                                Explore Showcase
                            </Button>
                        </Link>
                    </div>
                    
                    <div className="pt-8 flex items-center gap-4">
                        <div className="flex -space-x-2">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200" />
                            ))}
                        </div>
                        <p className="text-sm text-gray-500">
                            Join <span className="font-semibold text-gray-900">5,000+ creators</span> building better documentation.
                        </p>
                    </div>

                    <div className="w-full mt-16 rounded-xl border bg-card text-card-foreground shadow-lg overflow-hidden max-w-5xl mx-auto">
                        <div className="border-b bg-muted/50 px-4 py-2 flex items-center gap-2">
                             <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-400" />
                                <div className="w-3 h-3 rounded-full bg-amber-400" />
                                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                             </div>
                             <div className="text-xs text-muted-foreground font-mono mx-auto">writeverse.config.js</div>
                        </div>
                        <div className="p-6 bg-slate-950 text-slate-50 font-mono text-sm overflow-x-auto text-left">
                            <pre><code>{`// Initialize WriteVerse
initDocs({
  name: "knowledge-base",
  theme: "modern-dark",
  output: "./docs",
})

// Build and publish
buildAndDeploy()`}</code></pre>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;