"use client";

import { TOC } from "@/types";
import { useEffect, useRef, useState } from "react";

export default function TableOfContents() {
  const [headings, setHeadings] = useState<TOC[]>([]);
  const [activeId, setActiveId] = useState("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const section = document.querySelector('section#content-container');
    if (!section) return;

    // extract all h2/h3
const extractedHeadings: TOC[] = [];
Array.from(section.querySelectorAll("h2, h3")).forEach((heading) => {
  if (heading.id && heading.textContent) {
    extractedHeadings.push({
      id: heading.id,
      text: heading.textContent.trim(),
      level: heading.tagName === "H2" ? 0 : 1,
    });
  }
});

    setHeadings(extractedHeadings);

    if (extractedHeadings.length === 0) return;

    // observe for when 20% of each heading is visible
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.intersectionRatio >= 0.2);
        if (visible) {
          requestAnimationFrame(() => setActiveId(visible.target.id));
        }
      },
      {
        rootMargin: "0px 0px -80% 0px", // Fire when top 20% enters viewport
        threshold: 0.2,
      }
    );

    extractedHeadings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    observerRef.current = observer;
    return () => observer.disconnect();
  }, []);

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({
      top: el.offsetTop - 80, // navbar offset
      behavior: "smooth",
    });
    setActiveId(id);
  };

  if (!headings.length) {
    return null;
  }

  return (
    <aside className="hidden lg:block sticky top-16 max-h-[calc(100vh-64px)] px-4 py-6 w-64 border-l dark:border-gray-700 overflow-auto">
      <h3 className="mb-4 text-sm font-medium text-gray-500 dark:text-gray-400">
        On this page
      </h3>
      <nav className="space-y-1">
        {headings.map(({ id, text, level }) => {
          const isActive = id === activeId;
          return (
            <button
              key={id}
              onClick={() => handleClick(id)}
              className={[
                "w-full text-left rounded px-2 py-1 text-sm",
                level > 0 ? "ml-4" : "",
                isActive
                  ? "font-semibold text-blue-600 dark:text-blue-400 bg-gray-100 dark:bg-gray-800"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {text}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
