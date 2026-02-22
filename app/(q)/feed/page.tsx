"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  ArrowRight, 
  Search,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { useState, useEffect, useRef, useMemo } from "react"
import SearchBar from "../_components/SearchBar"
import IntegrationGrid from "../_components/IntegrationGrid"
import FeedCarousel from "./_components/FeedCarousel"
import GoToTop from "../_components/GoToTop"
import { fetchAllFeeds } from "@/actions/document"
import { FeedData } from "@/types/api"
import { cn } from "@/lib/utils"
import FeedSkeleton from "./_components/FeedSkeleton"

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

  const searchQuery = params?.search || ""
  const selectedCategory = params?.category ? params.category.split(",") : ["All"]
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

  if (loading || !params) return <FeedSkeleton />;

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-white dark:bg-background">
      {/* Search and Navigation Header */}
      <div className="sticky top-16 z-30 w-full bg-white/90 dark:bg-background/90 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between py-4 gap-4">
            
            {/* Nav Container with Scroll Indicators */}
            <div className="relative flex-1 group min-w-0">
                {showLeftArrow && (
                    <div className="absolute left-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-r from-white dark:from-background to-transparent flex items-center h-full pointer-events-none">
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
                    <div className="absolute right-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-l from-white dark:from-background to-transparent flex items-center justify-end h-full pointer-events-none">
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
        
        {/* Featured Content Carousel */}
        {!searchQuery && featuredDocs.length > 0 && (
          <FeedCarousel featuredDocs={featuredDocs} />
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
            <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-secondary p-1 rounded-full">
              <Button variant="ghost" size="sm" className="rounded-full h-8 text-xs font-bold bg-white dark:bg-card shadow-sm px-4">Most Recent</Button>
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
            <div className="flex flex-col items-center justify-center py-32 text-center bg-slate-50 dark:bg-zinc-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
              <div className="w-20 h-20 bg-slate-100 dark:bg-zinc-900 rounded-2xl flex items-center justify-center mb-6">
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
