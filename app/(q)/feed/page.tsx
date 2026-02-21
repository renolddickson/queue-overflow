"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  Search, 
  ArrowRight, 
  MessageSquare, 
  ThumbsUp, 
  Share2, 
  Play, 
  Sparkles,
  Zap,
  Shield,
  Layers,
  Globe,
  Github,
  Twitter,
  Linkedin,
  FileText,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import Image from "next/image"
import { useState, useEffect, useRef, useMemo } from "react"
import SearchBar from "../_components/SearchBar"
import IntegrationGrid from "../_components/IntegrationGrid"
import GoToTop from "../_components/GoToTop"
import { fetchAllFeeds } from "@/actions/document"
import { FeedData } from "@/types/api"
import { cn } from "@/lib/utils"
import DocumentPlaceholder from "@/components/common/DocumentPlaceholder"

export default function FeedPage({
  searchParams,
}: {
  searchParams: any
}) {
  const [docData, setDocData] = useState<FeedData[]>([])
  const [loading, setLoading] = useState(true)
  const [params, setParams] = useState<any>(null)
  
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)

  const searchQuery = params?.search || ""
  const selectedCategory = params?.category ? params.category.split(",") : ["All"]
  const currentPage = Number(params?.page) || 1
  const categories = ["All", "Technology", "Design", "Business", "Lifestyle", "Education"];

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setShowLeftArrow(scrollLeft > 0)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  useEffect(() => {
    const timer = setTimeout(checkScroll, 100)
    window.addEventListener('resize', checkScroll)
    return () => {
        window.removeEventListener('resize', checkScroll)
        clearTimeout(timer)
    }
  }, [docData, searchQuery, params])

  const featuredDocs = useMemo(() => docData.slice(0, 5), [docData]);

  useEffect(() => {
    if (featuredDocs.length === 0 || searchQuery) return;
    
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % featuredDocs.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [featuredDocs.length, searchQuery]);

  useEffect(() => {
    async function init() {
        const awaitedParam = await searchParams;
        setParams(awaitedParam);
        const q = awaitedParam.search || ""
        try {
            const response = await fetchAllFeeds(q);
            setDocData((response.data as any as FeedData[]) || []);
        } catch (err) {
            console.error('Error fetching feeds:', err);
        } finally {
            setLoading(false);
        }
    }
    init();
  }, [searchParams])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const amount = direction === 'left' ? -200 : 200
      scrollContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' })
    }
  }

  if (loading || !params) return null;

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-white dark:bg-slate-950">
      {/* Search and Navigation Header */}
      <div className="sticky top-16 z-30 w-full bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between py-4 gap-4">
            
            {/* Nav Container with Scroll Indicators */}
            <div className="relative flex-1 group min-w-0">
                {showLeftArrow && (
                    <div className="absolute left-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-r from-white dark:from-slate-950 to-transparent flex items-center h-full pointer-events-none">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full bg-white/80 dark:bg-slate-900/80 shadow-md pointer-events-auto hover:bg-white dark:hover:bg-slate-800"
                            onClick={() => scroll('left')}
                        >
                            <ChevronLeft size={16} />
                        </Button>
                    </div>
                )}
                
                <div 
                    ref={scrollContainerRef}
                    onScroll={checkScroll}
                    className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth p-1 w-full"
                >
                    {categories.map((cat) => (
                        <Link
                        key={cat}
                        href={cat === "All" ? "/feed" : `/feed?category=${cat}`}
                        className={`text-xs font-bold whitespace-nowrap transition-all px-4 py-2 rounded-full border ${
                            (cat === "All" && selectedCategory.includes("All")) || selectedCategory.includes(cat)
                            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-md shadow-slate-200 dark:shadow-none scale-105"
                            : "bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-slate-100"
                        }`}
                        >
                        {cat}
                        </Link>
                    ))}
                </div>

                {showRightArrow && (
                    <div className="absolute right-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-l from-white dark:from-slate-950 to-transparent flex items-center justify-end h-full pointer-events-none">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full bg-white/80 dark:bg-slate-900/80 shadow-md pointer-events-auto hover:bg-white dark:hover:bg-slate-800"
                            onClick={() => scroll('right')}
                        >
                            <ChevronRight size={16} />
                        </Button>
                    </div>
                )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8 md:py-12 space-y-12">
        
        {/* Microsoft Store Style Banner Layout - FULL WIDTH CAROUSEL */}
        {!searchQuery && featuredDocs.length > 0 && (
          <div className="relative w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-slate-950">
            {featuredDocs.map((doc, index) => (
              <div 
                key={doc.id}
                className={cn(
                  "absolute inset-0 transition-all duration-1000 ease-in-out flex flex-col justify-center px-8 md:px-16 lg:px-24",
                  index === activeSlide ? "opacity-100 translate-x-0 scale-100" : "opacity-0 translate-x-20 scale-105 pointer-events-none"
                )}
                style={{
                  background: index === 0 ? "linear-gradient(135deg, #0e7490 0%, #155e75 100%)" : 
                              index === 1 ? "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)" :
                              index === 2 ? "linear-gradient(135deg, #7c2d12 0%, #44403c 100%)" :
                              index === 3 ? "linear-gradient(135deg, #164e63 0%, #083344 100%)" :
                              "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)"
                }}
              >
                {/* Floating Icon Grid Pattern - Animated like Microsoft Store */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 select-none">
                  <div 
                    className={cn(
                      "grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 md:gap-6 transform transition-all duration-[3000ms] ease-out",
                      index === activeSlide ? "rotate-[15deg] -translate-y-10 translate-x-10 scale-110" : "rotate-[25deg] -translate-y-20 translate-x-20 scale-150 blur-sm"
                    )}
                  >
                    {[...Array(48)].map((_, i) => (
                      <div 
                        key={i} 
                        className={cn(
                          "aspect-square bg-white/10 rounded-xl backdrop-blur-md flex items-center justify-center p-2 border border-white/5 shadow-inner transition-opacity duration-1000",
                          activeSlide === index ? "opacity-100" : "opacity-0"
                        )}
                        style={{
                          transitionDelay: `${(i % 10) * 50}ms`,
                        }}
                      >
                        {/* Smaller inner elements to mimic app tiles */}
                        <div className="w-full h-full bg-slate-100/10 rounded-lg flex items-center justify-center overflow-hidden">
                           {i % 7 === 0 ? (
                             <div className="w-1/2 h-1/2 rounded bg-gradient-to-br from-white/40 to-transparent rotate-45" />
                           ) : i % 5 === 0 ? (
                             <div className="w-2/3 h-1 bg-white/20 rounded-full" />
                           ) : i % 3 === 0 ? (
                             <div className="w-2 h-2 rounded-full border border-white/30" />
                           ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Content Overlay */}
                <div className="relative z-10 max-w-2xl space-y-6">
                  {index === 0 && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                      <Sparkles size={14} className="text-yellow-400" /> Featured Collection
                    </div>
                  )}
                  
                  <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight drop-shadow-2xl">
                    {doc.title}
                  </h2>
                  <p className="text-white/70 text-lg md:text-xl line-clamp-2 max-w-lg leading-relaxed">
                    {doc.description || "In-depth explorations and comprehensive guides for the modern tech stack."}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-4 pt-4">
                    <Link href={`/${doc.type}/${doc.id}`}>
                        <button className="bg-white text-slate-900 hover:bg-slate-50 rounded-xl px-10 h-14 text-lg font-bold shadow-2xl transition-all active:scale-95">
                          See details
                        </button>
                    </Link>
                    <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 rounded-xl px-8 h-14 text-lg font-bold transition-all">
                       Learn more
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Visual Indicators */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
              {featuredDocs.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSlide(i)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-500",
                    i === activeSlide ? "w-8 bg-white" : "w-2 bg-white/30 hover:bg-white/50"
                  )}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            {/* Side Controls */}
            <div className="absolute inset-y-0 left-4 right-4 flex items-center justify-between pointer-events-none">
                <button 
                  onClick={() => setActiveSlide((prev) => (prev - 1 + featuredDocs.length) % featuredDocs.length)}
                  className="w-12 h-12 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white pointer-events-auto transition-all transition-opacity opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={() => setActiveSlide((prev) => (prev + 1) % featuredDocs.length)}
                  className="w-12 h-12 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white pointer-events-auto transition-all transition-opacity opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight size={24} />
                </button>
            </div>
          </div>
        )}


        {/* Content Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="space-y-1">
                <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {searchQuery ? `Search results for "${searchQuery}"` : 'Latest technical stories'}
                </h2>
                <p className="text-sm text-slate-500">Hand-picked guides and tutorials from the community.</p>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-full">
              <Button variant="ghost" size="sm" className="rounded-full h-8 text-xs font-bold bg-white dark:bg-slate-800 shadow-sm px-4">Most Recent</Button>
              <Button variant="ghost" size="sm" className="rounded-full h-8 text-xs font-bold px-4">Popular</Button>
            </div>
          </div>

          {docData.length > 0 ? (
            <div className="space-y-12">
              <IntegrationGrid integrations={docData} />
              
              {/* Pagination Placeholder */}
              <div className="flex items-center justify-center py-10 border-t border-slate-50 dark:border-slate-900">
                <Button variant="outline" className="rounded-full px-10 h-12 gap-2 font-bold group">
                    Load more stories <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6">
                <Search className="text-slate-400 w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">No matches found</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mt-2 text-lg">
                We couldn&apos;t find anything matching your search. Try different keywords or browse categories.
              </p>
              <Link href="/feed" className="mt-8">
                <Button className="rounded-full px-8 h-12 font-bold">Clear all filters</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
      <GoToTop />
    </main>
  );
}
