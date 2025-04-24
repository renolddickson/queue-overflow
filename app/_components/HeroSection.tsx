import CodeBlock from "@/components/shared/CodeBlock";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const HeroSection = () => {
    const sampleCode = {
        config: {
            language: 'js',
        },
        data: `initDocs({
      name: "my-awesome-docs",
      theme: "minimal",
      output: "./dist",
    })
    
    buildDocs()`
    }
    return (
        <section className="pt-28 pb-16 md:pt-32 md:pb-24 overflow-hidden">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
                    <div className="flex flex-col space-y-6">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
                            Create and Share <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Knowledge</span> Effortlessly
                        </h1>
                        <p className="text-xl text-gray-600 max-w-[600px]">
                            Write and publish beautiful documents and blog posts with rich media, code blocks, and collaborative features.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 pt-2">
                            <Link href="/feed">
                                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium inline-flex items-center group">
                                    Get Started
                                    <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </Link>
                            <button className="px-6 py-3 bg-white text-gray-800 border border-gray-300 rounded-lg font-medium">
                                View Examples
                            </button>
                        </div>
                        <div className="pt-4 text-sm text-gray-500 flex items-center gap-4">
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div
                                        key={i}
                                        className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 -ml-2 first:ml-0 overflow-hidden"
                                        style={{ zIndex: 6 - i }}
                                    />
                                ))}
                            </div>
                            <p>Trusted by 5,000+ content creators</p>
                        </div>
                    </div>

                    <div className="relative md:h-[500px] flex">
                        <div className="absolute -top-4 -left-4 w-24 h-24 bg-purple-100 rounded-full opacity-80"></div>
                        <div className="absolute bottom-12 -right-4 w-40 h-40 bg-blue-100 rounded-full opacity-80"></div>

                        <div className="relative bg-white shadow-xl rounded-xl p-3 z-20 w-full md:w-[90%] h-auto">
                            <div className="bg-gray-50 rounded-lg p-4 border">
                                <div className="flex justify-between mb-4">
                                    <div className="flex gap-1">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    </div>
                                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                                </div>

                                <div className="space-y-3">
                                    <div className="h-8 bg-blue-200 rounded w-3/4"></div>
                                    <div className="flex gap-2">
                                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/5"></div>
                                    </div>
                                    <div className="h-32 bg-gray-200 rounded"></div>
                                    <CodeBlock content={sampleCode} />
                                    {/* <div className="bg-gray-800 text-gray-200 p-4 rounded text-sm font-mono">
                                        <code>
                                            <div className="text-blue-400">const</div> <div className="text-green-300">doc</div> = <div className="text-purple-300">createDoc</div>({'{'}
                                            <br />
                                            &nbsp;&nbsp;<div className="text-yellow-300">title</div>: <div className="text-orange-300">&apos;Getting Started&apos;</div>,
                                            <br />
                                            &nbsp;&nbsp;<div className="text-yellow-300">content</div>: <div className="text-orange-300">&apos;Welcome to WriteVerse!&apos;</div>
                                            <br />
                                            {'}'});
                                        </code>
                                    </div> */}
                                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 text-yellow-700">
                                        Remember to save your changes before publishing!
                                    </div>
                                    {/* <div className="flex gap-2">
                                        <div className="h-8 bg-blue-500 rounded w-24"></div>
                                        <div className="h-8 bg-gray-200 rounded w-24"></div>
                                    </div> */}
                                </div>
                            </div>
                        </div>

                        <div className="absolute top-20 -right-8 md:-right-12 w-32 h-44 bg-white shadow-lg rounded-lg z-10 rotate-6">
                            <div className="h-4 w-24 bg-gray-200 rounded m-2"></div>
                            <div className="h-32 bg-purple-200 rounded mx-2"></div>
                            <div className="flex justify-end m-2">
                                <div className="h-4 w-12 bg-purple-500 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;