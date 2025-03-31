"use client"; // Only needed if using Next.js 13 App Router

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation"; 
import { FileText, Search, X } from "lucide-react";

// Example categories
type SearchCategory = "Docs" | "Pages";

interface SearchItem {
  id: number;
  title: string;
  url: string;
  category: SearchCategory;
}

// Sample data
const SEARCH_DATA: SearchItem[] = [
  { id: 1, title: "Feed", url: "/feed", category: "Pages" },
  { id: 2, title: "Getting Started", url: "/", category: "Pages" },
  { id: 3, title: "Login / Signup", url: "/auth", category: "Pages" },
  { id: 4, title: "Feedback", url: "/feedback", category: "Pages" },
  { id: 5, title: "Profile", url: "/profile", category: "Pages" }
];

export default function SearchPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Filter items based on query
  const filteredItems = SEARCH_DATA.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase())
  );

  // Navigate on click (or Enter, below)
  const handleNavigate = (url: string) => {
    router.push(url);
    setIsOpen(false);
    setQuery("");
  };

  // Open on Ctrl+K, close on Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close if user clicks outside the modal
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Press Enter to go to the first filtered item
  const handleEnterKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && filteredItems.length > 0) {
      handleNavigate(filteredItems[0].url);
    }
  };

  return (
    <div className="relative">
      {/* Search bar with Ctrl+K hint */}
      <div className="items-center space-x-2 border border-gray-300 rounded-md p-2 w-72 bg-white text-black hidden sm:flex">
        <input
          type="text"
          placeholder="Search documentation..."
          className="bg-transparent focus:outline-none flex-1 text-black"
          onFocus={() => setIsOpen(true)}
        />
        <span className="bg-gray-100 text-xs px-1 py-0.5 rounded-sm text-gray-500">
          Ctrl K
        </span>
      </div>
      <div className="sm:hidden">
        <Search onClick={() => setIsOpen(true)} />
      </div>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-25 p-4">
          <div
            ref={modalRef}
            className="relative w-full max-w-xl mt-24 bg-white text-black rounded-lg shadow-lg ring-1 ring-black ring-opacity-5"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4">
              {/* Category badges (optional) */}
              <div className="space-x-2">
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                  Docs
                </span>
                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                  Pages
                </span>
              </div>
              {/* Esc button */}
              <button
                onClick={() => setIsOpen(false)}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
              >
                <span>Esc</span>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleEnterKey}
                type="text"
                placeholder="What are you searching for?"
                className="w-full px-4 py-2 bg-gray-100 text-black rounded-md focus:outline-none"
              />
            </div>

            {/* Results */}
            <ul className="max-h-64 overflow-y-auto">
              {filteredItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleNavigate(item.url)}
                >
                  <FileText className="w-5 h-5 mr-2 text-gray-500" />
                  <span>{item.title}</span>
                </li>
              ))}
              {filteredItems.length === 0 && (
                <li className="px-4 py-2 text-gray-500">
                  No results found.
                </li>
              )}
            </ul>

            <div className="h-4" />
          </div>
        </div>
      )}
    </div>
  );
}
