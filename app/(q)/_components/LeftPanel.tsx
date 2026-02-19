"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import Icon from "@/components/shared/Icon";
import Link from "next/link";

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
  const pathParts = activePath.split("/");
  const activeSubTopicId = pathParts[pathParts.length - 1];

  const handleLinkClick = (path: string) => {
    setActivePath(path);
  };

  return (
    <nav className="w-64 border-r border-gray-200 dark:border-gray-700 px-4 py-6 sticky top-16 min-h-[calc(100vh-64px)] overflow-y-auto bg-white dark:bg-slate-900">
      <div className="space-y-6">
        {topics.map((section) => {
          const isActiveTopic = activeSubTopicId === section.id || section.subTopics.some(
            (st) => st.id === activeSubTopicId
          );

          return (
            <div key={section.id} className="space-y-1">
              <Link
                href={`/docs/${docId}/${section.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleLinkClick(
                    `/docs/${docId}/${section.id}`
                  );
                }}
                className={`
                  flex items-center gap-2 group px-2 py-1.5 rounded-md transition-all
                  ${isActiveTopic
                    ? "text-slate-900 dark:text-slate-50 font-semibold"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"}
                `}
              >
                <div className={`p-1 rounded-md transition-colors ${isActiveTopic ? 'bg-blue-50 dark:bg-blue-500/10' : 'group-hover:bg-slate-100 dark:group-hover:bg-slate-800'}`}>
                  <Icon name={section.icon} className={`h-4 w-4 ${isActiveTopic ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-600'}`} />
                </div>
                <span className="text-sm truncate">{section.title}</span>
                {section.subTopics.length > 0 && (
                  <ChevronRight
                    className={`ml-auto h-3.5 w-3.5 transition-transform ${isActiveTopic ? "rotate-90 text-slate-400" : "text-slate-300 group-hover:text-slate-400"
                      }`}
                  />
                )}
              </Link>

              {isActiveTopic && section.subTopics.length > 0 && (
                <div className="ml-4 border-l border-slate-200 dark:border-slate-800 pl-4 py-1 space-y-1">
                  {section.subTopics.map((item) => {
                    const isActive = activeSubTopicId === item.id;
                    return (
                      <Link
                        key={item.id}
                        href={`/docs/${docId}/${item.id}`}
                        onClick={() =>
                          handleLinkClick(`/docs/${docId}/${item.id}`)
                        }
                        className={`
                          block text-sm py-1 transition-all relative
                          ${isActive
                            ? "text-blue-600 dark:text-blue-400 font-medium"
                            : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                          }
                        `}
                      >
                        {isActive && (
                          <div className="absolute -left-[17px] top-1 bottom-1 w-[2px] bg-blue-600 dark:bg-blue-400 rounded-full" />
                        )}
                        {item.title}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}

