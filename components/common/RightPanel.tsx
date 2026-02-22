"use client";

import { TOC } from "@/types";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export default function TableOfContents() {
  const [headings, setHeadings] = useState<TOC[]>([]);
  const [activeId, setActiveId] = useState("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const section = document.querySelector('section#content-container');
    if (!section) return;

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

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) {
          setActiveId(visible.target.id);
        }
      },
      {
        rootMargin: "-80px 0px -80% 0px",
        threshold: 0,
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
    const offset = 100; // Header offset
    const bodyRect = document.body.getBoundingClientRect().top;
    const elementRect = el.getBoundingClientRect().top;
    const elementPosition = elementRect - bodyRect;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
    setActiveId(id);
  };

  if (!headings.length) return null;

  return (
    <aside className="sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto invisible-scrollbar">
      <div className="space-y-4 pb-8 border-l border-slate-100 dark:border-slate-800/50 ml-1">
        <p className="pl-4 text-[11px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">
            Overview
        </p>
        
        <nav className="flex flex-col">
            {headings.map(({ id, text, level }) => {
            const isActive = id === activeId;
            return (
                <button
                key={id}
                onClick={() => handleClick(id)}
                className={cn(
                    "group relative w-full text-left pl-4 pr-2 py-1.5 text-[13px] transition-all duration-200 border-l-2 -ml-[2px]",
                    isActive 
                        ? "text-orange-600 dark:text-orange-500 border-orange-600 dark:border-orange-500 font-bold" 
                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                )}
                >
                <span className={cn(
                    "block truncate",
                    level > 0 && "pl-4 text-[12px] opacity-80"
                )}>
                    {text}
                </span>
                </button>
            );
            })}
        </nav>
      </div>
    </aside>
  );
}
