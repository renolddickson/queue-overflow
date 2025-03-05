"use client";

import { TOC } from "@/types";
import { useEffect, useRef, useState } from "react";

export default function TableOfContents() {
  const [headings, setHeadings] = useState<TOC[]>([]);
  const [activeId, setActiveId] = useState("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const section = document.querySelector('section#content-container');
    console.log(section);
    
    if (section) {
      console.log(section.querySelectorAll("h2, h3"));
      
      const extractedHeadings = Array.from(section.querySelectorAll("h2, h3"))
        .map((heading) => heading.id && heading.textContent ? {
          id: heading.id,
          text: heading.textContent || null,
          level: heading.tagName === "H2" ? 0 : 2,
        } : null)
        .filter((heading): heading is TOC => heading !== null);
      setHeadings(extractedHeadings);

      if (extractedHeadings.length) {
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

        extractedHeadings.forEach((heading) => {
          const element = document.getElementById(heading.id);
          if (element) observer.observe(element);
        });

        observerRef.current = observer;

        return () => observer.disconnect();
      }
    }
  }, []);


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
    <div className={`hidden w-64 ${headings.length > 0 ? 'border-l' : ''} px-4 py-6 lg:block sticky top-16 max-h-fit min-h-[calc(100vh-64px)]`}>
      {headings && headings.length > 0 &&
        <>
          <h3 className="mb-4 text-sm font-medium text-gray-500">On this page</h3>
          <nav className="space-y-2">
            {headings.map((topic) => (
              <button
                key={topic.id} // Use topic.id instead of index
                onClick={() => handleClick(topic.id)}
                className={`block rounded-lg px-3 py-1 text-sm ${activeId === topic.id
                    ? "text-blue-400 font-semibold"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  } ${topic.level > 0 ? 'ml-2' : ''}`}
              >
                {topic.text}
              </button>
            ))}
          </nav>
        </>
      }
    </div>
  );
}
