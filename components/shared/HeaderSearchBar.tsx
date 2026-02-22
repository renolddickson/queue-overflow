"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation"; 
import { Search, X, Compass, ArrowUpRight, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

// Example categories
type SearchCategory = "Docs" | "Posts" | "Pages";

interface SearchItem {
  id: string;
  title: string;
  url: string;
  category: SearchCategory;
  description?: string;
}

// Sample data
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
  const [query, setQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
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
    setQuery("");
    inputRef.current?.blur();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setIsOpen(false);
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

  return (
    <div className="relative w-full max-w-xs group" ref={dropdownRef}>
      {/* Search Bar Pill */}
      <div 
        className={cn(
          "flex items-center gap-3 bg-slate-100 dark:bg-secondary rounded-full px-4 py-2 border transition-all duration-200",
          isOpen 
            ? "border-slate-300 dark:border-zinc-800 bg-white dark:bg-background shadow-sm" 
            : "border-transparent hover:border-slate-200 dark:hover:border-zinc-800"
        )}
      >
        <Search className="w-5 h-5 text-slate-500 shrink-0" />
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
          placeholder="Search"
          className="bg-transparent focus:outline-none flex-1 text-base text-slate-600 dark:text-slate-300 placeholder:text-slate-400"
        />
        {query && (
          <button onClick={() => setQuery("")} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-3 w-80 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] z-[9999] overflow-visible animate-in fade-in slide-in-from-top-1 duration-200">
          {/* Top Arrow/Pointer */}
          <div className="absolute -top-[6px] left-6 w-3 h-3 bg-white dark:bg-zinc-900 border-t border-l border-slate-200 dark:border-zinc-800 rotate-45 z-[-1]" />
          
          <div className="p-1">
            {!query ? (
              /* Initial State: Explore topics */
              <button
                onClick={() => handleNavigate("/feed")}
                className="flex items-center justify-between w-full p-4 hover:bg-slate-50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors group/item"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                    <Compass className="w-5 h-5" />
                  </div>
                  <span className="text-lg font-medium text-slate-700 dark:text-slate-200">Explore topics</span>
                </div>
                <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover/item:text-slate-500 transition-colors" />
              </button>
            ) : (
              /* Search Results */
              <div className="py-2">
                {filteredItems.length > 0 ? (
                  <div className="space-y-1">
                    {filteredItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleNavigate(item.url)}
                        className="flex items-center gap-3 w-full px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors group/item"
                      >
                        <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col items-start overflow-hidden">
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate w-full text-left">
                            {item.title}
                          </span>
                          {item.description && (
                            <span className="text-xs text-slate-400 truncate w-full text-left">
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
            )}
          </div>
        </div>
      )}
    </div>
  );
}
