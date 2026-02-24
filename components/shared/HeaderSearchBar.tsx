import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation"; 
import { Search, X, Compass, ArrowUpRight, FileText, Command } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// ... (SearchCategory and SearchItem interfaces stay the same)
type SearchCategory = "Docs" | "Posts" | "Pages";

interface SearchItem {
  id: string;
  title: string;
  url: string;
  category: SearchCategory;
  description?: string;
}

const SEARCH_DATA: SearchItem[] = [
  { id: "1", title: "Feed", url: "/feed", category: "Pages", description: "Your personalized content feed" },
  { id: "2", title: "Getting Started", url: "/", category: "Pages", description: "Learn how to use the platform" },
  { id: "3", title: "Login / Signup", url: "/auth", category: "Pages" },
  { id: "4", title: "Feedback", url: "/feedback", category: "Pages" },
  { id: "5", title: "Profile", url: "/profile", category: "Pages" },
  { id: "6", title: "Documentation Overview", url: "/docs", category: "Docs" },
];

export default function HeaderSearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const filteredItems = query 
    ? SEARCH_DATA.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description?.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleNavigate = (url: string) => {
    router.push(url);
    setIsOpen(false);
    setIsMobileSearchOpen(false);
    setQuery("");
    inputRef.current?.blur();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (window.innerWidth < 768) {
          setIsMobileSearchOpen(true);
        } else {
          inputRef.current?.focus();
        }
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        setIsMobileSearchOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleEnterKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && filteredItems.length > 0) {
      handleNavigate(filteredItems[0].url);
    }
  };

  const renderSearchResults = () => {
    if (!query) {
      return (
        <button
          onClick={() => handleNavigate("/feed")}
          className="flex items-center justify-between w-full p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors group/item"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
              <Compass className="w-5 h-5" />
            </div>
            <span className="text-lg font-medium text-slate-700 dark:text-slate-200">Explore topics</span>
          </div>
          <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover/item:text-slate-500 transition-colors" />
        </button>
      );
    }

    return (
      <div className="py-2">
        {filteredItems.length > 0 ? (
          <div className="space-y-1">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.url)}
                className="flex items-center gap-3 w-full px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors group/item text-left"
              >
                <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex flex-col items-start overflow-hidden flex-1">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate w-full">
                    {item.title}
                  </span>
                  {item.description && (
                    <span className="text-xs text-slate-400 truncate w-full">
                      {item.description}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center text-slate-400 text-sm">
            No results for "{query}"
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Search - Icon Button */}
      <div className="md:hidden">
        <Dialog open={isMobileSearchOpen} onOpenChange={setIsMobileSearchOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 bg-slate-100 dark:bg-slate-900 rounded-full border border-transparent hover:border-slate-200 dark:hover:border-slate-800">
              <Search className="h-4 w-4 text-slate-500" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] p-0 gap-0 top-[20%] border-none shadow-2xl bg-white dark:bg-slate-950 rounded-3xl overflow-hidden">
            <DialogHeader className="p-4 border-b border-slate-100 dark:border-slate-900">
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 rounded-2xl px-4 py-2">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                  ref={mobileInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleEnterKey}
                  placeholder="Search and explore..."
                  className="bg-transparent focus:outline-none flex-1 text-base text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                  autoFocus
                />
                {query && (
                  <button onClick={() => setQuery("")} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full">
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                )}
              </div>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {renderSearchResults()}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Desktop Search - Pill */}
      <div className="hidden md:block relative w-full group" ref={dropdownRef}>
        <div 
          className={cn(
            "flex items-center gap-3 bg-slate-100 dark:bg-slate-900 rounded-full px-4 py-2 border border-transparent transition-all duration-200",
            isOpen 
              ? "border-slate-300 dark:border-slate-800 bg-white dark:bg-black shadow-lg" 
              : "hover:border-slate-200 dark:hover:border-slate-800"
          )}
        >
          <Search className="w-4 h-4 text-slate-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleEnterKey}
            placeholder="Search documents..."
            className="bg-transparent focus:outline-none flex-1 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
          />
          {!isOpen && (
             <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 border border-slate-300/50 dark:border-slate-700/50">
                <Command size={10} className="text-slate-500" />
                <span className="text-[10px] font-bold text-slate-500">K</span>
             </div>
          )}
          {query && (
            <button onClick={() => setQuery("")} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
              <X className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 mt-3 w-80 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-1">
              {renderSearchResults()}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
