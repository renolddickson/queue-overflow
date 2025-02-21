"use client";

import { TOC } from "@/types";
import { useEffect, useRef, useState } from "react";

interface TableOfContentsProps {
  topics: TOC[];
}

export default function TableOfContents({ topics }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!topics.length) return; // Prevent running on empty topics

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries.find((entry) => entry.isIntersecting);
        if (visibleEntry) {
          requestAnimationFrame(() => setActiveId(visibleEntry.target.id));
        }
      },
      { 
        rootMargin: "0px 0px -30% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
       }
    );

    topics.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    observerRef.current = observer;

    return () => observer.disconnect();
  }, [topics]);

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
