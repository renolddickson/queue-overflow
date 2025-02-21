"use client";

import { TOC } from "@/types";
import { useEffect, useState } from "react";

interface TableOfContentsProps {
  topics: TOC[];
}

export default function TableOfContents({ topics }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    if (topics.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        console.log(entries);
        
        const visibleEntry = entries.find((entry) => entry.isIntersecting);
        console.log(visibleEntry);
        
        if (visibleEntry) {
          setActiveId(visibleEntry.target.id);
        }
      },
      { rootMargin: "-50% 0px -50% 0px", threshold: 0.1 }
    );

    // Observe each topic heading
    const elements = topics.map((topic) => document.getElementById(topic.id)).filter(Boolean);
    elements.forEach((el) => observer.observe(el!));

    return () => {
      elements.forEach((el) => observer.unobserve(el!));
      observer.disconnect();
    };
  }, [topics]); // Remove `activeId` dependency

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80, // Adjust for navbar height
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="hidden w-64 border-l px-4 py-6 lg:block sticky top-16 max-h-fit min-h-[calc(100vh-64px)]">
      <h3 className="mb-4 text-sm font-medium text-gray-500">On this page</h3>
      <nav className="space-y-2">
        {topics.map((topic) => (
          <button
            key={topic.id} // Use topic.id instead of index
            onClick={() => handleClick(topic.id)}
            className={`block rounded-lg px-3 py-2 text-sm ${
              activeId === topic.id
                ? "text-blue-600 font-medium"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            {topic.text}
          </button>
        ))}
      </nav>
    </div>
  );
}
