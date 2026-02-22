"use client";

import { useEffect, useState } from "react";
import { ChevronDown, FileText } from "lucide-react";
import Icon from "@/components/shared/Icon";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Topic = {
  id: string;
  title: string;
  icon: string;
  position: number;
  subTopics: { id: string; title: string; position: number }[];
};

export default function LeftPanel({
  initialPath,
  topics,
  docId,
}: {
  initialPath: string;
  topics: Topic[];
  docId: string;
}) {
  const [activePath, setActivePath] = useState(initialPath ?? "");
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>(() => {
    if (!initialPath) return {};
    const parts = initialPath.split("/");
    const id = parts[parts.length - 1];
    const initialExpanded: Record<string, boolean> = {};
    
    topics.forEach(t => {
      if (t.id === id || t.subTopics.some(st => st.id === id)) {
        initialExpanded[t.id] = true;
      }
    });
    return initialExpanded;
  });

  const pathParts = activePath.split("/");
  const currentId = pathParts[pathParts.length - 1];

  // Sync state if initialPath changes externally
  useEffect(() => {
    setActivePath(initialPath);
    if (initialPath) {
      const parts = initialPath.split("/");
      const id = parts[parts.length - 1];
      
      const parentTopic = topics.find(t => 
        t.id === id || t.subTopics.some(st => st.id === id)
      );
      
      if (parentTopic) {
        setExpandedTopics(prev => ({ ...prev, [parentTopic.id]: true }));
      }
    }
  }, [initialPath, topics]);

  const toggleTopic = (topicId: string, hasSubTopics: boolean) => {
    if (hasSubTopics) {
      setExpandedTopics(prev => ({ ...prev, [topicId]: !prev[topicId] }));
    }
  };

  return (
    <nav className="w-64 border-r border-gray-100 dark:border-gray-800/50 px-2 py-8 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto bg-white dark:bg-slate-950 scrollbar-none">
      <div className="space-y-8">
        {/* Navigation Group */}
        <div className="space-y-1">
          <p className="px-4 text-[11px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-4">
            GET STARTED
          </p>
          
          {topics.map((topic) => {
            const hasSubTopics = topic.subTopics.length > 0;
            const isTopicActive = currentId === topic.id;
            const isSubTopicActive = topic.subTopics.some(st => st.id === currentId);
            const isExpanded = expandedTopics[topic.id];

            return (
              <div key={topic.id} className="group/topic">
                <div className="relative">
                  {/* Left Active Line Indicator for Topic */}
                  {(isTopicActive || (isSubTopicActive && !isExpanded)) && (
                    <div className="absolute left-0 top-1 bottom-1 w-[2px] bg-orange-600 dark:bg-orange-500 rounded-full z-10" />
                  )}
                  
                  <div className="flex items-center">
                    <Link
                      href={`/docs/${docId}/${topic.id}`}
                      onClick={() => {
                        setActivePath(`/docs/${docId}/${topic.id}`);
                        if (hasSubTopics && !isExpanded) {
                          setExpandedTopics(prev => ({ ...prev, [topic.id]: true }));
                        }
                      }}
                      className={cn(
                        "flex-1 flex items-center gap-2.5 px-4 py-2 rounded-lg transition-all duration-200 leading-tight",
                        isTopicActive
                          ? "text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-500/5 font-bold"
                          : isSubTopicActive
                            ? "text-slate-900 dark:text-slate-100 font-semibold"
                            : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/50"
                      )}
                    >
                      <div className={cn(
                        "flex items-center justify-center shrink-0 w-5 h-5",
                        isTopicActive ? "text-orange-600 dark:text-orange-400" : "text-slate-400 dark:text-slate-500"
                      )}>
                        <Icon name={topic.icon || "FileText"} className="h-4 w-4" />
                      </div>
                      <span className="text-sm truncate">{topic.title}</span>
                    </Link>

                    {hasSubTopics && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleTopic(topic.id, true);
                        }}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg mr-1 transition-colors group"
                      >
                        <ChevronDown
                          className={cn(
                            "h-3.5 w-3.5 text-slate-400 transition-transform duration-300",
                            isExpanded ? "rotate-0" : "-rotate-90 group-hover:text-slate-600"
                          )}
                        />
                      </button>
                    )}
                  </div>
                </div>

                {/* Sub-topics list with height transition */}
                <div 
                  className={cn(
                    "overflow-hidden transition-all duration-200 ease-out pl-4",
                    isExpanded ? "max-h-[500px] opacity-100 py-1" : "max-h-0 opacity-0"
                  )}
                >
                  <div className="ml-[10px] border-l border-slate-100 dark:border-slate-800/50 flex flex-col space-y-0.5">
                    {topic.subTopics.map((sub) => {
                      const isActive = currentId === sub.id;
                      return (
                        <Link
                          key={sub.id}
                          href={`/docs/${docId}/${sub.id}`}
                          onClick={() => setActivePath(`/docs/${docId}/${sub.id}`)}
                          className={cn(
                            "group/sub relative pl-6 py-1.5 text-sm transition-all duration-200",
                            isActive
                              ? "text-orange-600 dark:text-orange-400 font-bold"
                              : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                          )}
                        >
                          {/* Left branch indicator */}
                          <div className={cn(
                            "absolute left-0 top-1/2 -translate-y-1/2 w-3 h-[1px] bg-slate-100 dark:bg-slate-800/50 group-hover/sub:bg-slate-200",
                            isActive && "bg-orange-600 dark:bg-orange-500"
                          )} />
                          
                          {/* Active Dot indicator */}
                          {isActive && (
                            <div className="absolute left-[-2px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-orange-600 dark:bg-orange-500 ring-2 ring-white dark:ring-slate-950" />
                          )}
                          
                          <span className="truncate block">{sub.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
